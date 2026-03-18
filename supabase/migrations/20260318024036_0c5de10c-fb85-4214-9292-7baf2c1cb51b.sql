
-- Lookup tables for autocomplete
CREATE TABLE public.shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sires_lookup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.breeders_lookup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sires_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeders_lookup ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Shows are publicly readable" ON public.shows FOR SELECT TO public USING (true);
CREATE POLICY "Sires are publicly readable" ON public.sires_lookup FOR SELECT TO public USING (true);
CREATE POLICY "Breeders are publicly readable" ON public.breeders_lookup FOR SELECT TO public USING (true);

-- Public insert
CREATE POLICY "Anyone can add shows" ON public.shows FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can add sires" ON public.sires_lookup FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can add breeders" ON public.breeders_lookup FOR INSERT TO public WITH CHECK (true);

-- Add foreign key columns to winners
ALTER TABLE public.winners ADD COLUMN show_id uuid REFERENCES public.shows(id);
ALTER TABLE public.winners ADD COLUMN sire_id uuid REFERENCES public.sires_lookup(id);
ALTER TABLE public.winners ADD COLUMN breeder_id uuid REFERENCES public.breeders_lookup(id);

-- Seed data
INSERT INTO public.shows (name) VALUES
  ('Arizona Nationals'),
  ('Houston Livestock Show'),
  ('OYE (Oklahoma Youth Expo)'),
  ('Ohio State Fair'),
  ('Fort Worth Stock Show'),
  ('San Antonio Stock Show'),
  ('Denver National Western'),
  ('Indiana State Fair'),
  ('Louisville North American'),
  ('American Royal');

INSERT INTO public.sires_lookup (name) VALUES
  ('Double T'),
  ('Ride Time'),
  ('Zerbach'),
  ('Compass'),
  ('2.0'),
  ('Beast'),
  ('Trifecta');

INSERT INTO public.breeders_lookup (name) VALUES
  ('Time Ranch'),
  ('Staci Show Mac'),
  ('Silvers Livestock'),
  ('Stone Show Stock'),
  ('Beatty''s Club Lambs'),
  ('Whitcomb Club Lambs'),
  ('Allen Newcomb Show Lambs');
