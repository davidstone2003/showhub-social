
-- Exhibitors table
CREATE TABLE public.exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exhibitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exhibitors" ON public.exhibitors
  FOR SELECT TO authenticated USING (created_by_user_id = auth.uid());

CREATE POLICY "Users can insert own exhibitors" ON public.exhibitors
  FOR INSERT TO authenticated WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update own exhibitors" ON public.exhibitors
  FOR UPDATE TO authenticated USING (created_by_user_id = auth.uid());

-- User-exhibitor relationships
CREATE TABLE public.user_exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exhibitor_id UUID REFERENCES public.exhibitors(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'other',
  use_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_breeder_id UUID,
  last_show_name TEXT,
  last_sire_name TEXT,
  last_dam_name TEXT,
  UNIQUE (user_id, exhibitor_id)
);

ALTER TABLE public.user_exhibitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_exhibitors" ON public.user_exhibitors
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user_exhibitors" ON public.user_exhibitors
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user_exhibitors" ON public.user_exhibitors
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own user_exhibitors" ON public.user_exhibitors
  FOR DELETE TO authenticated USING (user_id = auth.uid());
