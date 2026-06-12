
ALTER TABLE public.winners ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.winners ADD COLUMN IF NOT EXISTS date_assumed boolean NOT NULL DEFAULT false;
UPDATE public.winners
   SET date_assumed = true
 WHERE date IS NOT NULL
   AND date = (created_at AT TIME ZONE 'UTC')::date;
