
-- Drop the prior single-purpose table (only just introduced, safe to replace)
DROP TABLE IF EXISTS public.scraped_sales;

CREATE TABLE public.scraped_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_key TEXT NOT NULL,
  sale_name TEXT,
  sale_date TEXT,
  location TEXT,
  managed_by TEXT,
  top_lots JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, source_key)
);

GRANT SELECT ON public.scraped_results TO anon, authenticated;
GRANT ALL ON public.scraped_results TO service_role;
ALTER TABLE public.scraped_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scraped results are public" ON public.scraped_results FOR SELECT USING (true);

CREATE TABLE public.scraped_upcoming (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_key TEXT NOT NULL,
  sale_name TEXT,
  sale_date TEXT,
  end_time TEXT,
  seller TEXT,
  location TEXT,
  link TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, source_key)
);

GRANT SELECT ON public.scraped_upcoming TO anon, authenticated;
GRANT ALL ON public.scraped_upcoming TO service_role;
ALTER TABLE public.scraped_upcoming ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scraped upcoming sales are public" ON public.scraped_upcoming FOR SELECT USING (true);

CREATE TABLE public.scrape_source_status (
  source TEXT NOT NULL PRIMARY KEY,
  last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scrape_source_status TO anon, authenticated;
GRANT ALL ON public.scrape_source_status TO service_role;
ALTER TABLE public.scrape_source_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Source status is public" ON public.scrape_source_status FOR SELECT USING (true);
