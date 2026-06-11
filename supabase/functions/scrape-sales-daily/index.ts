// Daily job: discovers new SC Online Sales results and scrapes each via Firecrawl.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';
const INDEX_URL = 'https://www.sconlinesales.com/sale-results';
const MAX_NEW_PER_RUN = 10;

const topSellerSchema = {
  type: 'object',
  properties: {
    saleName: { type: 'string' },
    date: { type: 'string' },
    location: { type: 'string' },
    totalHead: { type: 'number' },
    averagePrice: { type: 'string' },
    topSellers: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          lot: { type: 'string' },
          price: { type: 'string' },
          sire: { type: 'string' },
          breeder: { type: 'string' },
          photo: { type: 'string' },
        },
        required: ['lot', 'price', 'breeder'],
      },
    },
  },
  required: ['topSellers'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return json({ error: 'Missing required environment configuration' }, 500);
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // 1) Discover candidate sale URLs from the SC Online sale-results index
    const mapRes = await fetch(`${FIRECRAWL_V2}/map`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: INDEX_URL, limit: 200, includeSubdomains: false }),
    });
    const mapData = await mapRes.json();
    if (!mapRes.ok) {
      console.error('Firecrawl map error', mapRes.status, mapData);
      return json({ error: 'Discovery failed', details: mapData }, 502);
    }

    const rawLinks: string[] = Array.isArray(mapData?.links)
      ? mapData.links.map((l: any) => (typeof l === 'string' ? l : l?.url)).filter(Boolean)
      : Array.isArray(mapData?.data?.links)
      ? mapData.data.links.map((l: any) => (typeof l === 'string' ? l : l?.url)).filter(Boolean)
      : [];

    // Keep only individual sale-result pages, dedupe
    const candidates = Array.from(
      new Set(
        rawLinks.filter(
          (u) =>
            /sconlinesales\.com\/sale-results\//i.test(u) &&
            !/\/sale-results\/?$/i.test(u),
        ),
      ),
    );

    // 2) Skip ones we've already scraped
    const { data: existing } = await sb
      .from('scraped_sales')
      .select('source_url')
      .in('source_url', candidates);
    const known = new Set((existing ?? []).map((r: any) => r.source_url));
    const fresh = candidates.filter((u) => !known.has(u)).slice(0, MAX_NEW_PER_RUN);

    const results: any[] = [];
    for (const url of fresh) {
      try {
        const scrapeRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            formats: [
              {
                type: 'json',
                schema: topSellerSchema,
                prompt:
                  'Extract sale name, date, location, total head sold, average price, and the top 3 highest-priced lots with lot number, price, sire (if listed), breeder, and the absolute URL of the lot photo.',
              },
            ],
            onlyMainContent: true,
          }),
        });
        const scrapeData = await scrapeRes.json();
        if (!scrapeRes.ok) {
          console.error('scrape failed', url, scrapeRes.status, scrapeData);
          results.push({ url, ok: false });
          continue;
        }
        const extracted = scrapeData?.data?.json ?? scrapeData?.json ?? null;
        if (!extracted || !Array.isArray(extracted.topSellers) || extracted.topSellers.length === 0) {
          results.push({ url, ok: false, reason: 'no-data' });
          continue;
        }

        const row = {
          source_url: url,
          sale_name: extracted.saleName ?? null,
          sale_date: extracted.date ?? null,
          location: extracted.location ?? null,
          total_head: typeof extracted.totalHead === 'number' ? extracted.totalHead : null,
          average_price: extracted.averagePrice ?? null,
          top_sellers: extracted.topSellers.slice(0, 3).map((s: any) => ({
            lot: String(s.lot ?? ''),
            price: String(s.price ?? ''),
            sire: s.sire ? String(s.sire) : undefined,
            breeder: String(s.breeder ?? ''),
            photo: s.photo && /^https?:\/\//.test(s.photo) ? s.photo : undefined,
          })),
          scraped_at: new Date().toISOString(),
        };

        const { error: upErr } = await sb
          .from('scraped_sales')
          .upsert(row, { onConflict: 'source_url' });
        if (upErr) {
          console.error('upsert error', url, upErr);
          results.push({ url, ok: false, reason: upErr.message });
          continue;
        }
        results.push({ url, ok: true, saleName: row.sale_name });
      } catch (e) {
        console.error('scrape exception', url, e);
        results.push({ url, ok: false, reason: e instanceof Error ? e.message : 'unknown' });
      }
    }

    return json({
      discovered: candidates.length,
      alreadyKnown: known.size,
      attempted: fresh.length,
      succeeded: results.filter((r) => r.ok).length,
      results,
    }, 200);
  } catch (err) {
    console.error('scrape-sales-daily error', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
