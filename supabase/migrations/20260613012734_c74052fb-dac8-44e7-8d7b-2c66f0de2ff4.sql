ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS photo_credit text NULL,
  ADD COLUMN IF NOT EXISTS photo_credit_breeder_id uuid NULL REFERENCES public.breeder_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_photo_credit_breeder_id ON public.posts(photo_credit_breeder_id);