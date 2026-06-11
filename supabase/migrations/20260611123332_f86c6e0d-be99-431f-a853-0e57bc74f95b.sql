
-- Required extensions for fuzzy show-name matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================
-- 1. canonical_events
-- ============================================================
CREATE TABLE public.canonical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('winner','sale')),
  show_name TEXT NOT NULL,
  show_name_normalized TEXT NOT NULL,
  event_date DATE,
  species TEXT,
  placement_slot TEXT,
  breeder_name TEXT,
  breeder_name_normalized TEXT,
  verified_level TEXT NOT NULL DEFAULT 'none' CHECK (verified_level IN ('none','exhibitor','breeder')),
  best_image_url TEXT,
  best_source_type TEXT,
  best_source_id TEXT,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX canonical_events_kind_date_idx ON public.canonical_events (kind, event_date DESC);
CREATE INDEX canonical_events_name_trgm_idx ON public.canonical_events USING gin (show_name_normalized gin_trgm_ops);
CREATE INDEX canonical_events_breeder_trgm_idx ON public.canonical_events USING gin (breeder_name_normalized gin_trgm_ops);

GRANT SELECT ON public.canonical_events TO anon, authenticated;
GRANT ALL ON public.canonical_events TO service_role;
ALTER TABLE public.canonical_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "canonical_events public read" ON public.canonical_events FOR SELECT USING (true);
CREATE POLICY "canonical_events service write" ON public.canonical_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER canonical_events_updated_at
BEFORE UPDATE ON public.canonical_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. event_links
-- ============================================================
CREATE TABLE public.event_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_event_id UUID NOT NULL REFERENCES public.canonical_events(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('scrape_result','scrape_upcoming','winner','post','sale_record')),
  source_id TEXT NOT NULL,
  contributor_kind TEXT CHECK (contributor_kind IN ('scrape','exhibitor','breeder')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);

CREATE INDEX event_links_canonical_idx ON public.event_links (canonical_event_id);

GRANT SELECT ON public.event_links TO anon, authenticated;
GRANT ALL ON public.event_links TO service_role;
ALTER TABLE public.event_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_links public read" ON public.event_links FOR SELECT USING (true);
CREATE POLICY "event_links service write" ON public.event_links FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 3. event_aliases
-- ============================================================
CREATE TABLE public.event_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL,
  alias_normalized TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  canonical_normalized TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX event_aliases_canonical_idx ON public.event_aliases (canonical_normalized);

GRANT SELECT ON public.event_aliases TO anon, authenticated;
GRANT ALL ON public.event_aliases TO service_role;
ALTER TABLE public.event_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_aliases public read" ON public.event_aliases FOR SELECT USING (true);
CREATE POLICY "event_aliases service write" ON public.event_aliases FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 4. Normalization helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.normalize_event_name(_raw TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  s TEXT;
BEGIN
  IF _raw IS NULL THEN RETURN NULL; END IF;
  s := lower(unaccent(_raw));
  -- strip year tokens
  s := regexp_replace(s, '\b(19|20)\d{2}\b', '', 'g');
  -- strip punctuation
  s := regexp_replace(s, '[^a-z0-9 ]+', ' ', 'g');
  -- collapse common stopwords
  s := regexp_replace(s, '\b(the|and|of|at|in|on)\b', ' ', 'g');
  -- collapse whitespace
  s := regexp_replace(s, '\s+', ' ', 'g');
  RETURN trim(s);
END;
$$;

-- ============================================================
-- 5. Resolve alias -> canonical normalized name
-- ============================================================
CREATE OR REPLACE FUNCTION public.resolve_event_alias(_normalized TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT canonical_normalized FROM public.event_aliases WHERE alias_normalized = _normalized LIMIT 1),
    _normalized
  );
$$;

-- ============================================================
-- 6. match_or_create_event RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_or_create_event(
  _kind TEXT,
  _show_name TEXT,
  _event_date DATE,
  _species TEXT,
  _placement_slot TEXT,
  _breeder_name TEXT,
  _source_type TEXT,
  _source_id TEXT,
  _contributor_kind TEXT,
  _image_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_show_norm TEXT;
  v_show_resolved TEXT;
  v_breeder_norm TEXT;
  v_canonical_id UUID;
  v_existing_level TEXT;
  v_new_level_rank INT;
  v_existing_level_rank INT;
BEGIN
  v_show_norm := public.normalize_event_name(_show_name);
  v_show_resolved := public.resolve_event_alias(v_show_norm);
  v_breeder_norm := public.normalize_event_name(_breeder_name);

  -- Try to find an existing canonical event
  SELECT id, verified_level
    INTO v_canonical_id, v_existing_level
  FROM public.canonical_events ce
  WHERE ce.kind = _kind
    AND (
      ce.show_name_normalized = v_show_resolved
      OR public.resolve_event_alias(ce.show_name_normalized) = v_show_resolved
      OR similarity(ce.show_name_normalized, v_show_resolved) >= 0.75
    )
    AND (
      _event_date IS NULL
      OR ce.event_date IS NULL
      OR abs(ce.event_date - _event_date) <= 3
    )
    AND (
      _species IS NULL
      OR ce.species IS NULL
      OR lower(ce.species) = lower(_species)
    )
    AND (
      _kind <> 'winner'
      OR _placement_slot IS NULL
      OR ce.placement_slot IS NULL
      OR ce.placement_slot = _placement_slot
    )
    AND (
      v_breeder_norm IS NULL
      OR ce.breeder_name_normalized IS NULL
      OR ce.breeder_name_normalized = v_breeder_norm
      OR similarity(ce.breeder_name_normalized, v_breeder_norm) >= 0.75
    )
  ORDER BY ce.event_date DESC NULLS LAST
  LIMIT 1;

  IF v_canonical_id IS NULL THEN
    INSERT INTO public.canonical_events (
      kind, show_name, show_name_normalized, event_date, species,
      placement_slot, breeder_name, breeder_name_normalized,
      verified_level, best_image_url, best_source_type, best_source_id, post_count
    ) VALUES (
      _kind, _show_name, v_show_resolved, _event_date, _species,
      _placement_slot, _breeder_name, v_breeder_norm,
      CASE
        WHEN _contributor_kind = 'breeder' THEN 'breeder'
        WHEN _contributor_kind = 'exhibitor' THEN 'exhibitor'
        ELSE 'none'
      END,
      _image_url, _source_type, _source_id,
      CASE WHEN _source_type = 'post' THEN 1 ELSE 0 END
    )
    RETURNING id, verified_level INTO v_canonical_id, v_existing_level;
  END IF;

  -- Link source (idempotent)
  INSERT INTO public.event_links (canonical_event_id, source_type, source_id, contributor_kind)
  VALUES (v_canonical_id, _source_type, _source_id, _contributor_kind)
  ON CONFLICT (source_type, source_id) DO NOTHING;

  -- Upgrade verified level if richer contributor arrived
  v_existing_level_rank := CASE v_existing_level WHEN 'breeder' THEN 3 WHEN 'exhibitor' THEN 2 ELSE 1 END;
  v_new_level_rank := CASE _contributor_kind WHEN 'breeder' THEN 3 WHEN 'exhibitor' THEN 2 ELSE 1 END;

  IF v_new_level_rank > v_existing_level_rank THEN
    UPDATE public.canonical_events
       SET verified_level = _contributor_kind,
           best_image_url = COALESCE(_image_url, best_image_url),
           best_source_type = _source_type,
           best_source_id = _source_id
     WHERE id = v_canonical_id;
  ELSIF _image_url IS NOT NULL AND _source_type = 'post' THEN
    UPDATE public.canonical_events
       SET best_image_url = _image_url,
           best_source_type = _source_type,
           best_source_id = _source_id
     WHERE id = v_canonical_id
       AND (best_source_type IS NULL OR best_source_type IN ('scrape_result','scrape_upcoming'));
  END IF;

  -- Recompute post_count from links
  UPDATE public.canonical_events
     SET post_count = (
       SELECT count(*) FROM public.event_links
       WHERE canonical_event_id = v_canonical_id AND source_type = 'post'
     )
   WHERE id = v_canonical_id;

  RETURN v_canonical_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_or_create_event(TEXT,TEXT,DATE,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO service_role, authenticated;

-- ============================================================
-- 7. Seed common aliases
-- ============================================================
INSERT INTO public.event_aliases (alias, alias_normalized, canonical_name, canonical_normalized) VALUES
  ('OSF',            public.normalize_event_name('OSF'),            'Ohio State Fair',                 public.normalize_event_name('Ohio State Fair')),
  ('Ohio State',     public.normalize_event_name('Ohio State'),     'Ohio State Fair',                 public.normalize_event_name('Ohio State Fair')),
  ('NAILE',          public.normalize_event_name('NAILE'),          'North American International Livestock Exposition', public.normalize_event_name('North American International Livestock Exposition')),
  ('North American', public.normalize_event_name('North American'), 'North American International Livestock Exposition', public.normalize_event_name('North American International Livestock Exposition')),
  ('AKSARBEN',       public.normalize_event_name('AKSARBEN'),       'Aksarben Stock Show',             public.normalize_event_name('Aksarben Stock Show')),
  ('NJSS',           public.normalize_event_name('NJSS'),           'National Junior Summer Spectacular', public.normalize_event_name('National Junior Summer Spectacular')),
  ('NWSS',           public.normalize_event_name('NWSS'),           'National Western Stock Show',     public.normalize_event_name('National Western Stock Show')),
  ('San Antonio',    public.normalize_event_name('San Antonio'),    'San Antonio Stock Show',          public.normalize_event_name('San Antonio Stock Show')),
  ('Houston',        public.normalize_event_name('Houston'),        'Houston Livestock Show',          public.normalize_event_name('Houston Livestock Show')),
  ('Fort Worth',     public.normalize_event_name('Fort Worth'),     'Fort Worth Stock Show',           public.normalize_event_name('Fort Worth Stock Show'))
ON CONFLICT (alias_normalized) DO NOTHING;
