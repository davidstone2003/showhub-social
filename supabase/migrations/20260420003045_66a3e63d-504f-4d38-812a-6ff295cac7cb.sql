-- Sire catalog tables
CREATE TABLE public.catalog_breeders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  accent_color TEXT NOT NULL DEFAULT '#1a2a44',
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_sires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breeder_id UUID NOT NULL REFERENCES public.catalog_breeders(id) ON DELETE CASCADE,
  species TEXT NOT NULL DEFAULT 'sheep',
  sire_name TEXT NOT NULL,
  pedigree TEXT,
  notes TEXT,
  genotype TEXT,
  scrapie TEXT,
  spider TEXT,
  dwarf TEXT,
  semen_available BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC,
  ownership TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_sires_breeder ON public.catalog_sires(breeder_id);
CREATE INDEX idx_catalog_sires_species ON public.catalog_sires(species);

ALTER TABLE public.catalog_breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_sires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog breeders are publicly readable"
  ON public.catalog_breeders FOR SELECT USING (true);

CREATE POLICY "Admins can insert catalog breeders"
  ON public.catalog_breeders FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update catalog breeders"
  ON public.catalog_breeders FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete catalog breeders"
  ON public.catalog_breeders FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Catalog sires are publicly readable"
  ON public.catalog_sires FOR SELECT USING (true);

CREATE POLICY "Admins can insert catalog sires"
  ON public.catalog_sires FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update catalog sires"
  ON public.catalog_sires FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete catalog sires"
  ON public.catalog_sires FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_catalog_sires_updated_at
  BEFORE UPDATE ON public.catalog_sires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();