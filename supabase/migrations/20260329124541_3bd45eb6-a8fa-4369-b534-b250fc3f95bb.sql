
-- Add video_url column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url text;

-- Add video_url column to winners table  
ALTER TABLE public.winners ADD COLUMN IF NOT EXISTS video_url text;

-- Create post-media storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can read
CREATE POLICY "Post media is publicly readable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'post-media');

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload post media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-media');

-- Storage RLS: users can delete own uploads
CREATE POLICY "Users can delete own post media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);
