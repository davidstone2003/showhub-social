CREATE TABLE public.sire_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sire_name TEXT NOT NULL,
  breed TEXT,
  owner TEXT,
  semen_available BOOLEAN NOT NULL DEFAULT false,
  species TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.sire_submissions TO authenticated;
GRANT INSERT ON public.sire_submissions TO anon;
GRANT ALL ON public.sire_submissions TO service_role;

ALTER TABLE public.sire_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit a sire"
  ON public.sire_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "users see their own submissions"
  ON public.sire_submissions FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sire_submissions_updated_at
  BEFORE UPDATE ON public.sire_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();