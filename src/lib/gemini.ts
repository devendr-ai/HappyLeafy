import { File } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Google Gemini vision "second opinion" for plant problems. Free tier via a key
 * from https://aistudio.google.com. Free-tier quotas are per model, so we fall
 * back down this list when one model is rate-limited or unavailable.
 */
const MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
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
  // Models occasionally wrap JSON in a code fence despite the JSON mime type.
  const json = text.replace(/^```(?:json)?\s*|\s*```$/g, '');
  const raw = JSON.parse(json) as Partial<AiDiagnosis>;
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

export async function diagnoseWithGemini(photoUris: string[], ctx: DiagnosisContext, apiKey: string): Promise<AiDiagnosis> {
  if (!apiKey) throw new Error('Add your free Gemini API key in Settings first.');
  const images = await Promise.all(photoUris.map(toBase64));
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents: [
      {
        role: 'user',
        parts: [...images.map((data) => ({ inline_data: { mime_type: 'image/jpeg', data } })), { text: describe(ctx) }],
      },
    ],
    generationConfig: { response_mime_type: 'application/json', temperature: 0.2 },
  });

  let lastError = 'Gemini is unavailable right now.';
  for (const model of MODELS) {
    const res = await fetch(`${API}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body,
    });
    const json = (await res.json().catch(() => ({}))) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string; status?: string };
    };

    if (res.ok) {
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      try {
        return { ...parse(text), model };
      } catch {
        lastError = 'Gemini returned an unreadable answer. Try again.';
        continue;
      }
    }
    if (res.status === 400 && /API key/i.test(json.error?.message ?? '')) throw new Error('Gemini rejected the API key. Check it in Settings.');
    if (res.status === 403) throw new Error('Gemini refused the request (check that the key is enabled for the Gemini API).');
    // 404: model not available to this key; 429: that model's free quota is used up; 5xx: overloaded. Try the next model.
    if (res.status === 404 || res.status === 429 || res.status >= 500) {
      lastError = res.status === 429 ? 'Gemini free quota is used up for today. Try again tomorrow.' : (json.error?.message ?? lastError);
      continue;
    }
    throw new Error(json.error?.message ?? `Gemini request failed (HTTP ${res.status}).`);
  }
  throw new Error(lastError);
}
