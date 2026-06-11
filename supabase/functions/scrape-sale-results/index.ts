// Scrapes a sale results page via Firecrawl and returns structured top-seller data
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

interface TopSeller {
  lot: string;
  price: string;
  sire?: string;
  breeder: string;
  photo?: string;
}

interface ScrapeResponse {
  saleName?: string;
  date?: string;
  location?: string;
  totalHead?: number;
  averagePrice?: string;
  topSellers: TopSeller[];
  sourceUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return json({ error: 'FIRECRAWL_API_KEY not configured' }, 500);
    }

    const body = await req.json().catch(() => null);
    const url: string | undefined = body?.url;
    if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return json({ error: 'Valid url is required' }, 400);
    }

    const schema = {
      type: 'object',
      properties: {
        saleName: { type: 'string', description: 'Name of the sale' },
        date: { type: 'string', description: 'Date of the sale (e.g. "April 12, 2026")' },
        location: { type: 'string', description: 'Sale location, city/state, or "Online"' },
        totalHead: { type: 'number', description: 'Total number of head sold across the sale' },
        averagePrice: { type: 'string', description: 'Average sale price formatted with $' },
        topSellers: {
          type: 'array',
          description: 'The top 3 highest-priced lots from this sale, sorted by price descending',
          maxItems: 3,
          items: {
            type: 'object',
            properties: {
              lot: { type: 'string', description: 'Lot number, e.g. "Lot 7"' },
              price: { type: 'string', description: 'Sale price formatted with $' },
              sire: { type: 'string', description: 'Sire name if listed' },
              breeder: { type: 'string', description: 'Breeder / consignor name' },
              photo: { type: 'string', description: 'Absolute URL to the lot photo' },
            },
            required: ['lot', 'price', 'breeder'],
          },
        },
      },
      required: ['topSellers'],
    };

    const fcRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: [
          { type: 'json', schema, prompt: 'Extract sale name, date, location, total head sold, average price, and the top 3 highest-priced lots with lot number, price, sire (if listed), breeder, and the absolute URL of the lot photo. Return absolute https URLs for photos.' },
        ],
        onlyMainContent: true,
      }),
    });

    const fcData = await fcRes.json();
    if (!fcRes.ok) {
      console.error('Firecrawl error', fcRes.status, fcData);
      return json({ error: fcData?.error || `Firecrawl failed (${fcRes.status})` }, 502);
    }

    const extracted =
      fcData?.data?.json ?? fcData?.json ?? fcData?.data?.extract ?? null;

    if (!extracted || !Array.isArray(extracted.topSellers)) {
      return json({ error: 'No structured data extracted' }, 422);
    }

    const result: ScrapeResponse = {
      saleName: extracted.saleName,
      date: extracted.date,
      location: extracted.location,
      totalHead: typeof extracted.totalHead === 'number' ? extracted.totalHead : undefined,
      averagePrice: extracted.averagePrice,
      topSellers: extracted.topSellers
        .slice(0, 3)
        .map((s: any) => ({
          lot: String(s.lot ?? ''),
          price: String(s.price ?? ''),
          sire: s.sire ? String(s.sire) : undefined,
          breeder: String(s.breeder ?? ''),
          photo: s.photo && /^https?:\/\//.test(s.photo) ? s.photo : undefined,
        })),
      sourceUrl: url,
    };

    return json(result, 200);
  } catch (err) {
    console.error('scrape-sale-results error', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
