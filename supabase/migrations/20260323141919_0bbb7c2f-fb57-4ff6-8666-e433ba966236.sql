
-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  event_type text NOT NULL DEFAULT 'show',
  start_date date,
  end_date date,
  is_live boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  location text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Winner records table
CREATE TABLE public.winner_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  result_title text NOT NULL,
  exhibitor_name text NOT NULL,
  breeder_name text,
  sire_name text,
  dam text,
  placed_by text,
  species text,
  status text NOT NULL DEFAULT 'active',
  source text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.winner_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Winner records are publicly readable" ON public.winner_records FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert winner records" ON public.winner_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update winner records" ON public.winner_records FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete winner records" ON public.winner_records FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Sale records table
CREATE TABLE public.sale_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  lot_number text,
  title text NOT NULL,
  breeder_name text,
  buyer_name text,
  price numeric,
  species text,
  status text NOT NULL DEFAULT 'active',
  source text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sale records are publicly readable" ON public.sale_records FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert sale records" ON public.sale_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update sale records" ON public.sale_records FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sale records" ON public.sale_records FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Live updates table
CREATE TABLE public.live_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL DEFAULT 'show_result',
  species text,
  title text NOT NULL,
  line_1 text NOT NULL,
  line_2 text,
  image_url text,
  winner_record_id uuid REFERENCES public.winner_records(id) ON DELETE SET NULL,
  sale_record_id uuid REFERENCES public.sale_records(id) ON DELETE SET NULL,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live updates are publicly readable" ON public.live_updates FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert live updates" ON public.live_updates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update live updates" ON public.live_updates FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete live updates" ON public.live_updates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for live_updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_updates;
