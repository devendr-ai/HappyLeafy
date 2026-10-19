import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { proxyEnabled, proxyError, proxyFetch } from './proxy';
import type { CareProfile } from './types';

/**
 * Google Gemini vision "second opinion" for plant problems. Free tier via a key
 * from https://aistudio.google.com. Free-tier quotas are per model, so we fall
 * back down this list when one model is rate-limited or unavailable.
 */
// Fastest reliable first; the newest model is often overloaded, so it's a fallback.
const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

export type AiCause = {
  cause: string;
  likelihood: 'high' | 'medium' | 'low';
  why: string;
  fix: string;
};

export type AiDiagnosis = {
  summary: string;
  healthy: boolean;
  urgent: boolean;
  causes: AiCause[];
  nextSteps: string[];
  model: string;
};

export type DiagnosisContext = {
  plantName?: string;
  species?: string;
  daysSinceWatered?: number;
  wateringIntervalDays?: number;
  soil?: 'dry' | 'damp' | 'wet';
  light?: string;
  potMaterial?: string;
  potSize?: string;
  drainage?: boolean;
  location?: string;
  note?: string;
  /** Pl@ntNet's disease matches, if any, so Gemini can weigh them. */
  plantNetMatches?: { name: string; score: number }[];
  photoParts: string[];
};

const SYSTEM = `You are an expert, practical houseplant doctor. Diagnose problems from the user's photos and context.
Be honest about uncertainty. Prefer common causes (watering, light, humidity, pests) over rare diseases.
If the photos do not show a plant or are too unclear, say so in the summary and return no causes.
Use plain, friendly language for a beginner. Fixes must be concrete actions.
Reply ONLY with JSON matching:
{"summary": string, "healthy": boolean, "urgent": boolean,
 "causes": [{"cause": string, "likelihood": "high"|"medium"|"low", "why": string, "fix": string}],
 "nextSteps": string[]}
Give at most 3 causes, most likely first, and at most 4 next steps.`;

function describe(ctx: DiagnosisContext): string {
  const lines = [
    `Photos (in order): ${ctx.photoParts.join(', ')}.`,
    ctx.plantName && `Plant: ${ctx.plantName}${ctx.species ? ` (${ctx.species})` : ''}.`,
    ctx.daysSinceWatered !== undefined && `Last watered ${ctx.daysSinceWatered} day(s) ago${ctx.wateringIntervalDays ? `; usual interval ${ctx.wateringIntervalDays} days` : ''}.`,
    ctx.soil && `Soil feels ${ctx.soil} right now.`,
    ctx.light && `Light where it sits: ${ctx.light}.`,
    ctx.potMaterial && `Pot: ${ctx.potSize ?? ''} ${ctx.potMaterial}`.trim() + (ctx.drainage === false ? ', no drainage hole.' : '.'),
    ctx.location && `Location: ${ctx.location}.`,
    ctx.note && `Owner's note: ${ctx.note}`,
    ctx.plantNetMatches?.length &&
      `An image classifier suggested: ${ctx.plantNetMatches.map((m) => `${m.name} (${Math.round(m.score * 100)}%)`).join('; ')}. Treat this as a hint, not a fact.`,
  ];
  return lines.filter(Boolean).join('\n');
}

async function toBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri.slice(uri.indexOf(',') + 1);
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return dataUrl.slice(dataUrl.indexOf(',') + 1);
  }
  return new File(uri).base64();
}

function parse(text: string): Omit<AiDiagnosis, 'model'> {
  const raw = parseJson<Partial<AiDiagnosis>>(text);
  const likelihoods = ['high', 'medium', 'low'];
  return {
    summary: String(raw.summary ?? ''),
    healthy: !!raw.healthy,
    urgent: !!raw.urgent,
    causes: (raw.causes ?? []).slice(0, 3).map((c) => ({
      cause: String(c.cause ?? ''),
      likelihood: (likelihoods.includes(c.likelihood) ? c.likelihood : 'medium') as AiCause['likelihood'],
      why: String(c.why ?? ''),
      fix: String(c.fix ?? ''),
    })),
    nextSteps: (raw.nextSteps ?? []).slice(0, 4).map(String),
  };
}

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };
export type ChatTurn = { role: 'user' | 'model'; text: string };

/**
 * One generateContent call with model fallback. Returns the model's text and which model answered.
 * `json` asks for application/json output.
 */
async function generate(
  apiKey: string,
  system: string,
  contents: { role: 'user' | 'model'; parts: Part[] }[],
  json: boolean,
): Promise<{ text: string; model: string }> {
  if (!apiKey && !proxyEnabled) throw new Error('Add your free Gemini API key in Settings first.');
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: json ? { response_mime_type: 'application/json', temperature: 0.2 } : { temperature: 0.5 },
  });

  let lastError = 'Gemini is unavailable right now.';
  for (const model of MODELS) {
    // Own key: call Google directly. Otherwise go through the HappyLeafy proxy, which holds the key.
    // A busy model can hang for a long time; give up after 20 s and try the next one.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 20_000);
    let res: Response;
    try {
      res = apiKey
        ? await fetch(`${API}/${model}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body, signal: abort.signal })
        : await proxyFetch(`/v1/gemini/${model}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: abort.signal });
    } catch {
      lastError = 'The AI is busy right now. Try again in a minute.';
      continue;
    } finally {
      clearTimeout(timer);
    }
    const data = (await res.json().catch(() => ({}))) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string; status?: string };
    };
    // The proxy's own errors (daily limit, not configured) apply to every model: stop here.
    const own = !apiKey ? proxyError(data) : undefined;
    if (own) throw new Error(own);
    if (!apiKey && (res.status === 401 || res.status === 403 || (res.status === 400 && /API key/i.test(data.error?.message ?? '')))) {
      throw new Error('The AI doctor is unavailable right now. Please try later.');
    }

    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      if (text) return { text, model };
      lastError = 'Gemini returned an empty answer. Try again.';
      continue;
    }
    if (res.status === 400 && /API key/i.test(data.error?.message ?? '')) throw new Error('Gemini rejected the API key. Check it in Settings.');
    if (res.status === 403) throw new Error('Gemini refused the request (check that the key is enabled for the Gemini API).');
    // 404: model not available to this key; 429: that model's free quota is used up; 5xx: overloaded. Try the next model.
    if (res.status === 404 || res.status === 429 || res.status >= 500) {
      lastError = res.status === 429 ? 'Gemini free quota is used up for today. Try again tomorrow.' : (data.error?.message ?? lastError);
      continue;
    }
    throw new Error(data.error?.message ?? `Gemini request failed (HTTP ${res.status}).`);
  }
  throw new Error(lastError);
}

/** Models occasionally wrap JSON in a code fence despite the JSON mime type. */
function parseJson<T>(text: string): T {
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as T;
}

export async function diagnoseWithGemini(photoUris: string[], ctx: DiagnosisContext, apiKey: string): Promise<AiDiagnosis> {
  const images = await Promise.all(photoUris.map(toBase64));
  const parts: Part[] = [...images.map((data) => ({ inline_data: { mime_type: 'image/jpeg', data } })), { text: describe(ctx) }];
  // Retry once on unparseable output.
  for (let attempt = 0; ; attempt++) {
    const { text, model } = await generate(apiKey, SYSTEM, [{ role: 'user', parts }], true);
    try {
      return { ...parse(text), model };
    } catch {
      if (attempt >= 1) throw new Error('Gemini returned an unreadable answer. Try again.');
    }
  }
}

const CARE_SYSTEM = `You are a horticulturist writing an indoor care profile for one plant species, for a beginner.
Reply ONLY with JSON matching:
{"commonName": string, "waterEveryDays": integer 1-45, "fertilizeEveryDays": integer 7-180,
 "light": "low"|"medium"|"bright-indirect"|"direct", "humidity": "low"|"medium"|"high",
 "tempC": [min integer, max integer], "soil": string, "toxicToPets": boolean,
 "difficulty": "easy"|"moderate"|"hard", "tips": string[] (2-4 short, practical tips)}
Intervals are for the growing season indoors in a pot with drainage. If unsure about pet toxicity, answer true.`;

const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);
const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Ask Gemini for a care profile for a species missing from the bundled guide. */
export async function aiCareProfile(scientificName: string, commonName: string | undefined, apiKey: string): Promise<CareProfile> {
  const prompt = `Species: ${scientificName}${commonName ? ` (common name: ${commonName})` : ''}.`;
  for (let attempt = 0; ; attempt++) {
    const { text } = await generate(apiKey, CARE_SYSTEM, [{ role: 'user', parts: [{ text: prompt }] }], true);
    try {
      const raw = parseJson<Record<string, unknown>>(text);
      const temp = Array.isArray(raw.tempC) ? raw.tempC : [];
      return {
        key: scientificName,
        commonName: String(raw.commonName || commonName || scientificName),
        waterEveryDays: clampInt(raw.waterEveryDays, 1, 45, 7),
        fertilizeEveryDays: clampInt(raw.fertilizeEveryDays, 7, 180, 30),
        light: pick(raw.light, ['low', 'medium', 'bright-indirect', 'direct'] as const, 'bright-indirect'),
        humidity: pick(raw.humidity, ['low', 'medium', 'high'] as const, 'medium'),
        tempC: [clampInt(temp[0], -10, 35, 15), clampInt(temp[1], 0, 45, 27)],
        soil: String(raw.soil || 'Well-draining potting mix'),
        toxicToPets: raw.toxicToPets !== false,
        difficulty: pick(raw.difficulty, ['easy', 'moderate', 'hard'] as const, 'moderate'),
        tips: (Array.isArray(raw.tips) ? raw.tips : []).slice(0, 4).map(String),
      };
    } catch {
      if (attempt >= 1) throw new Error('Gemini returned an unreadable care guide. Try again.');
    }
  }
}

const CHAT_SYSTEM = `You are HappyLeafy's friendly plant expert. Answer questions about the user's plant using the plant details given.
Be concise (under 150 words unless asked for more), practical and honest about uncertainty. Write plain text only: no Markdown, no asterisks or #; for lists start lines with "• ".
If a question is unrelated to plants or gardening, politely steer back to plant care.`;

/** Multi-turn chat about one plant. `plantContext` is prepended to the first user turn. */
export async function askAboutPlant(plantContext: string, turns: ChatTurn[], apiKey: string): Promise<string> {
  const contents = turns.map((t, i) => ({
    role: t.role,
    parts: [{ text: i === 0 ? `My plant:\n${plantContext}\n\nQuestion: ${t.text}` : t.text }],
  }));
  return (await generate(apiKey, CHAT_SYSTEM, contents, false)).text;
}
