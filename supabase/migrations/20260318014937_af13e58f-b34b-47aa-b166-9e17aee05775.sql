-- Create winners table
CREATE TABLE public.winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  show_name TEXT NOT NULL,
  shown_by TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  bred_by TEXT,
  sired_by TEXT,
  dam TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read winners
CREATE POLICY "Winners are publicly readable"
  ON public.winners FOR SELECT
  USING (true);

-- Allow anyone to insert winners (no auth yet)
CREATE POLICY "Anyone can post winners"
  ON public.winners FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for winner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('winner-images', 'winner-images', true);

-- Allow public read access to winner images
CREATE POLICY "Winner images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'winner-images');

-- Allow anyone to upload winner images
CREATE POLICY "Anyone can upload winner images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'winner-images');