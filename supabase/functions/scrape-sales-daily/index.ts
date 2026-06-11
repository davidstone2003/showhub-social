// Daily scraper for Backdrop Sales page.
// Sources: Champion Drive (results) + SC Online Sales (upcoming sheep) + wlivestock (upcoming).
// Each source is scraped independently. On failure, previous data is preserved and
// last_error is recorded in scrape_source_status. A noon CT retry only re-runs
// sources that have not succeeded today.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

type SourceKey = 'champion-drive' | 'sc-online' | 'wlivestock';

const SOURCES: Record<SourceKey, { url: string; kind: 'results' | 'upcoming' }> = {
  'champion-drive': { url: 'https://championdrive.com/results/', kind: 'results' },
  'sc-online': { url: 'https://www.sconlinesales.com/Bids/UpcomingSales?lotType=4', kind: 'upcoming' },
  'wlivestock': { url: 'https://wlivestock.com/auctions', kind: 'upcoming' },
};

// ───── Firecrawl schemas ────────────────────────────────────────────────
const resultsSchema = {
  type: 'object',
  properties: {
    sales: {
      type: 'array',
      description: 'Each completed sale on the page',
      items: {
        type: 'object',
        properties: {
          saleName: { type: 'string' },
          date: { type: 'string' },
          location: { type: 'string' },
          managedBy: { type: 'string' },
          sourceUrl: { type: 'string', description: 'Link to the sale detail/results page' },
          topLots: {
            type: 'array',
            maxItems: 5,
            items: {
              type: 'object',
              properties: {
                lot: { type: 'string' },
                breeder: { type: 'string' },
                price: { type: 'string' },
                photo: { type: 'string', description: 'Absolute URL to lot photo' },
              },
              required: ['lot', 'breeder', 'price'],
            },
          },
        },
        required: ['saleName', 'topLots'],
      },
    },
  },
  required: ['sales'],
};

const upcomingSchema = {
  type: 'object',
  properties: {
    sales: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          saleName: { type: 'string' },
          date: { type: 'string', description: 'Sale date in human-readable form' },
          endTime: { type: 'string', description: 'End time if listed' },
          seller: { type: 'string', description: 'Seller / consignor name' },
          location: { type: 'string' },
          link: { type: 'string', description: 'Absolute URL to the full sale page' },
        },
        required: ['saleName'],
      },
    },
  },
  required: ['sales'],
};

// ───── Helpers ──────────────────────────────────────────────────────────
function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}

async function firecrawlScrape(apiKey: string, url: string, schema: unknown, prompt: string) {
  const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      formats: [{ type: 'json', schema, prompt }],
      onlyMainContent: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${data?.error || 'failed'}`);
  const extracted = data?.data?.json ?? data?.json ?? null;
  if (!extracted) throw new Error('No structured data extracted');
  return extracted;
}

async function recordStatus(
  sb: SupabaseClient,
  source: SourceKey,
  ok: boolean,
  error: string | null,
) {
  const now = new Date().toISOString();
  await sb.from('scrape_source_status').upsert(
    {
      source,
      last_attempt_at: now,
      last_success_at: ok ? now : undefined,
      last_error: ok ? null : error,
      updated_at: now,
    },
    { onConflict: 'source' },
  );
}

// ───── Canonical event linker ───────────────────────────────────────────
async function linkCanonical(
  sb: SupabaseClient,
  args: {
    kind: 'winner' | 'sale';
    show_name: string;
    event_date: string | null;
    species: string | null;
    placement_slot: string | null;
    breeder_name: string | null;
    source_type: 'scrape_result' | 'scrape_upcoming';
    source_id: string;
    image_url: string | null;
  },
) {
  try {
    await sb.rpc('match_or_create_event', {
      _kind: args.kind,
      _show_name: args.show_name,
      _event_date: args.event_date,
      _species: args.species,
      _placement_slot: args.placement_slot,
      _breeder_name: args.breeder_name,
      _source_type: args.source_type,
      _source_id: args.source_id,
      _contributor_kind: 'scrape',
      _image_url: args.image_url,
    });
  } catch (e) {
    console.error('match_or_create_event failed', e);
  }
}

function isoDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// ───── Per-source runners ──────────────────────────────────────────────
async function runChampionDrive(sb: SupabaseClient, apiKey: string) {
  const extracted = await firecrawlScrape(
    apiKey,
    SOURCES['champion-drive'].url,
    resultsSchema,
    'Extract every completed sale on this page. For each: sale name, date, location, who managed the sale, and the top 3-5 lots with lot number, breeder name, price, and the absolute URL of the lot photo if shown. Return absolute https URLs for photos and sale links.',
  );
  const sales = Array.isArray(extracted.sales) ? extracted.sales : [];
  let saved = 0;
  for (const s of sales) {
    if (!s?.saleName) continue;
    const key = slug(`${s.saleName}-${s.date ?? ''}`);
    const topLots = (Array.isArray(s.topLots) ? s.topLots : []).slice(0, 5).map((l: any) => ({
      lot: String(l.lot ?? ''),
      breeder: String(l.breeder ?? ''),
      price: String(l.price ?? ''),
      photo: l.photo && /^https?:\/\//.test(l.photo) ? l.photo : undefined,
    }));
    const { error } = await sb.from('scraped_results').upsert(
      {
        source: 'champion-drive',
        source_key: key,
        sale_name: s.saleName ?? null,
        sale_date: s.date ?? null,
        location: s.location ?? null,
        managed_by: s.managedBy ?? null,
        source_url: s.sourceUrl ?? null,
        top_lots: topLots,
        scraped_at: new Date().toISOString(),
      },
      { onConflict: 'source,source_key' },
    );
    if (!error) {
      saved++;
      const topBreeder = topLots[0]?.breeder || null;
      const topPhoto = topLots.find((l: any) => l.photo)?.photo || null;
      await linkCanonical(sb, {
        kind: 'sale',
        show_name: s.saleName,
        event_date: isoDate(s.date),
        species: null,
        placement_slot: null,
        breeder_name: topBreeder,
        source_type: 'scrape_result',
        source_id: `champion-drive:${key}`,
        image_url: topPhoto,
      });
    }
  }
  return { found: sales.length, saved };
}

async function runUpcoming(sb: SupabaseClient, apiKey: string, source: 'sc-online' | 'wlivestock') {
  const extracted = await firecrawlScrape(
    apiKey,
    SOURCES[source].url,
    upcomingSchema,
    source === 'sc-online'
      ? 'Extract every upcoming sheep sale: sale name, date, end time if any, seller name, location, and the absolute URL link to the full sale page.'
      : 'Extract every upcoming auction: sale name, sale date, consignor name, and the absolute URL link to the full auction page.',
  );
  const sales = Array.isArray(extracted.sales) ? extracted.sales : [];
  const runAt = new Date().toISOString();
  let saved = 0;
  for (const s of sales) {
    if (!s?.saleName) continue;
    const key = slug(`${s.saleName}-${s.date ?? ''}-${s.seller ?? ''}`);
    const { error } = await sb.from('scraped_upcoming').upsert(
      {
        source,
        source_key: key,
        sale_name: s.saleName ?? null,
        sale_date: s.date ?? null,
        end_time: s.endTime ?? null,
        seller: s.seller ?? null,
        location: s.location ?? null,
        link: s.link && /^https?:\/\//.test(s.link) ? s.link : null,
        scraped_at: runAt,
      },
      { onConflict: 'source,source_key' },
    );
    if (!error) {
      saved++;
      await linkCanonical(sb, {
        kind: 'sale',
        show_name: s.saleName,
        event_date: isoDate(s.date),
        species: source === 'sc-online' ? 'sheep' : null,
        placement_slot: null,
        breeder_name: s.seller ?? null,
        source_type: 'scrape_upcoming',
        source_id: `${source}:${key}`,
        image_url: null,
      });
    }
  }
  await sb.from('scraped_upcoming').delete().eq('source', source).lt('scraped_at', runAt);
  return { found: sales.length, saved };
}

async function runSource(sb: SupabaseClient, apiKey: string, source: SourceKey) {
  try {
    let result: { found: number; saved: number };
    if (source === 'champion-drive') result = await runChampionDrive(sb, apiKey);
    else result = await runUpcoming(sb, apiKey, source);
    await recordStatus(sb, source, true, null);
    return { source, ok: true, ...result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`[${source}] failed:`, msg);
    await recordStatus(sb, source, false, msg);
    return { source, ok: false, error: msg };
  }
}

// ───── Entrypoint ──────────────────────────────────────────────────────
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
    let body: any = null;
    try { body = await req.json(); } catch { /* no body */ }
    const mode: 'all' | 'retry-failed' = body?.mode === 'retry-failed' ? 'retry-failed' : 'all';

    let targets: SourceKey[] = ['champion-drive', 'sc-online', 'wlivestock'];

    if (mode === 'retry-failed') {
      const { data: statuses } = await sb.from('scrape_source_status').select('*');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const startOfDay = today.getTime();
      const succeededToday = new Set(
        (statuses ?? [])
          .filter((s: any) => s.last_success_at && new Date(s.last_success_at).getTime() >= startOfDay)
          .map((s: any) => s.source as SourceKey),
      );
      targets = targets.filter((t) => !succeededToday.has(t));
    }

    const runs = await Promise.all(targets.map((t) => runSource(sb, apiKey, t)));
    return json({ mode, runs }, 200);
  } catch (err) {
    console.error('scrape-sales-daily error', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
