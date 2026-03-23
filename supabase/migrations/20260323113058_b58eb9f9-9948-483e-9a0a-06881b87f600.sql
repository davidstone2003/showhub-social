
-- Create posts table (social layer)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  posted_as_breeder_id UUID REFERENCES public.breeder_profiles(id) ON DELETE SET NULL,
  caption TEXT,
  image_urls TEXT[] DEFAULT '{}'::TEXT[],
  tags TEXT[] DEFAULT '{}'::TEXT[],
  post_type TEXT NOT NULL DEFAULT 'winner',
  status TEXT NOT NULL DEFAULT 'active',
  show_on_feed BOOLEAN NOT NULL DEFAULT true,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add source_post_id to winners table
ALTER TABLE public.winners ADD COLUMN source_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any post" ON public.posts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
