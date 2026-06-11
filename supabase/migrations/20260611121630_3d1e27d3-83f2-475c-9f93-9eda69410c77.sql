
CREATE TABLE public.scraped_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL UNIQUE,
  sale_name TEXT,
  sale_date TEXT,
  location TEXT,
  total_head INTEGER,
  average_price TEXT,
  top_sellers JSONB NOT NULL DEFAULT '[]'::jsonb,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scraped_sales TO anon, authenticated;
GRANT ALL ON public.scraped_sales TO service_role;

ALTER TABLE public.scraped_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scraped sales are public" ON public.scraped_sales
  FOR SELECT USING (true);

CREATE INDEX idx_scraped_sales_scraped_at ON public.scraped_sales(scraped_at DESC);
