/**
 * HappyLeafy API proxy (Cloudflare Worker).
 *
 * Holds the Pl@ntNet and Gemini keys as secrets so they are never shipped in the app,
 * forwards the app's requests, and caps how much each device can use per day.
 *
 *   POST /v1/plantnet/identify   multipart (images, organs)  -> Pl@ntNet /v2/identify/all
 *   POST /v1/plantnet/diseases   multipart (images, organs)  -> Pl@ntNet /v2/diseases/identify
 *   POST /v1/gemini/:model       JSON generateContent body   -> Gemini generateContent
 *   GET  /v1/health
 *
 * Every request needs X-App-Token (a shared value baked into the app: it only stops casual
 * misuse, it is not a secret) and X-Device-Id (random id the app creates on first launch).
 */

export interface Env {
  PLANTNET_KEY: string;
  GEMINI_KEY: string;
  APP_TOKEN: string;
  USAGE: KVNamespace;
  /** Optional overrides (plain vars in wrangler.jsonc). */
  LIMIT_IDENTIFY?: string;
  LIMIT_DIAGNOSE?: string;
  LIMIT_AI?: string;
  LIMIT_PLANTNET_GLOBAL?: string;
}

type Kind = 'identify' | 'diagnose' | 'ai';

const PLANTNET = 'https://my-api.plantnet.org/v2';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_BODY = 15 * 1024 * 1024;
const MODEL = /^gemini-[a-z0-9.\-]+$/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-App-Token, X-Device-Id',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const fail = (status: number, error: string, message: string) => json({ error, message }, status);

const today = () => new Date().toISOString().slice(0, 10);

function limits(env: Env): Record<Kind, number> {
  return {
    identify: Number(env.LIMIT_IDENTIFY ?? 20),
    diagnose: Number(env.LIMIT_DIAGNOSE ?? 10),
    ai: Number(env.LIMIT_AI ?? 60),
  };
}

/** Daily counters in KV (approximate under heavy concurrency, which is fine for fair-use caps). */
async function count(env: Env, key: string): Promise<number> {
  return Number((await env.USAGE.get(key)) ?? 0);
}
async function bump(env: Env, key: string, current: number) {
  await env.USAGE.put(key, String(current + 1), { expirationTtl: 2 * 86400 });
}

/** Pass the upstream response back with CORS headers; strip anything that could echo our key. */
async function relay(upstream: Response): Promise<Response> {
  const body = await upstream.text();
  return new Response(body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json', ...CORS } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/v1/health') return json({ ok: true, plantnet: !!env.PLANTNET_KEY, gemini: !!env.GEMINI_KEY });
    if (request.method !== 'POST') return fail(405, 'method', 'Use POST.');

    if (!env.APP_TOKEN || request.headers.get('X-App-Token') !== env.APP_TOKEN) return fail(401, 'token', 'Unknown app.');
    const device = request.headers.get('X-Device-Id') ?? '';
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(device)) return fail(400, 'device', 'Missing device id.');
    const size = Number(request.headers.get('Content-Length') ?? 0);
    if (size > MAX_BODY) return fail(413, 'too_large', 'Photos are too large.');

    let kind: Kind;
    let target: string;
    let headers: Record<string, string>;
    const gemini = url.pathname.match(/^\/v1\/gemini\/([^/]+)$/);
    if (url.pathname === '/v1/plantnet/identify' || url.pathname === '/v1/plantnet/diseases') {
      if (!env.PLANTNET_KEY) return fail(503, 'not_configured', 'Plant identification is not set up on the server.');
      kind = url.pathname.endsWith('identify') ? 'identify' : 'diagnose';
      const path = kind === 'identify' ? 'identify/all' : 'diseases/identify';
      target = `${PLANTNET}/${path}?api-key=${encodeURIComponent(env.PLANTNET_KEY)}&nb-results=5&lang=en&include-related-images=false`;
      headers = { 'Content-Type': request.headers.get('Content-Type') ?? '' };
      if (!headers['Content-Type'].startsWith('multipart/form-data')) return fail(400, 'format', 'Expected photos.');
    } else if (gemini && MODEL.test(gemini[1])) {
      if (!env.GEMINI_KEY) return fail(503, 'not_configured', 'The AI doctor is not set up on the server.');
      kind = 'ai';
      target = `${GEMINI}/${gemini[1]}:generateContent`;
      headers = { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY };
    } else {
      return fail(404, 'not_found', 'Unknown endpoint.');
    }

    // Per-device daily cap, plus a global Pl@ntNet cap to stay under its 500/day free quota.
    const day = today();
    const deviceKey = `d:${kind}:${device}:${day}`;
    const used = await count(env, deviceKey);
    if (used >= limits(env)[kind]) {
      const what = kind === 'ai' ? 'AI questions' : kind === 'identify' ? 'identifications' : 'diagnoses';
      return fail(429, 'daily_limit', `You've used today's free ${what}. Try again tomorrow.`);
    }
    const globalKey = `g:plantnet:${day}`;
    const globalUsed = kind === 'ai' ? 0 : await count(env, globalKey);
    if (kind !== 'ai' && globalUsed >= Number(env.LIMIT_PLANTNET_GLOBAL ?? 450)) {
      return fail(429, 'busy', 'Plant identification is busy today. Try again tomorrow.');
    }

    const upstream = await fetch(target, { method: 'POST', headers, body: request.body });
    // Count successful calls and Pl@ntNet's "no match" (404); not key/config errors or outages.
    if (upstream.ok || (kind !== 'ai' && upstream.status === 404)) {
      await bump(env, deviceKey, used);
      if (kind !== 'ai') await bump(env, globalKey, globalUsed);
    }
    return relay(upstream);
  },
} satisfies ExportedHandler<Env>;
