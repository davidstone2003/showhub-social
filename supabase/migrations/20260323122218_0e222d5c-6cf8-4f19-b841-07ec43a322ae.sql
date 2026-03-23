
CREATE TABLE public.exhibitor_animal_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exhibitor_name TEXT NOT NULL,
  breeder_id UUID,
  sire_id UUID REFERENCES public.sires_lookup(id),
  sire_name TEXT,
  show_id UUID REFERENCES public.shows(id),
  show_name TEXT,
  dam_name TEXT,
  use_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exhibitor_animal_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own context" ON public.exhibitor_animal_context
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own context" ON public.exhibitor_animal_context
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own context" ON public.exhibitor_animal_context
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own context" ON public.exhibitor_animal_context
  FOR DELETE TO authenticated USING (user_id = auth.uid());
