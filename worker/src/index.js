// Najmi drawing server (Cloudflare Worker).
// Receives a scene description and returns a picture made with Cloudflare Workers AI.
// It never receives children's names or photos, only the scene description.

const MODEL = '@cf/black-forest-labs/flux-1-schnell';
const TRANSLATE = '@cf/meta/m2m100-1.2b';

// Only our website may use this server.
const ALLOWED_ORIGINS = [
  'https://atefnansi-max.github.io',
  'http://localhost:5173',
];

const STYLE =
  "A full colorful background scene, cute flat children's book illustration, bright soft pastel colors, " +
  'cheerful and warm, simple shapes, kindergarten style, sky and ground fill the whole picture, ' +
  'the lower middle area is fairly open';
const NO_TEXT =
  'Absolutely no text, no writing, no letters, no words, no numbers, no signs, no labels, no logos, ' +
  'no people, no children';

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });
}

// Arabic words in the prompt make the picture model draw fake writing, so translate first.
async function toEnglish(env, text) {
  if (!text || !/[؀-ۿ]/.test(text)) return text || '';
  try {
    const r = await env.AI.run(TRANSLATE, { text, source_lang: 'arabic', target_lang: 'english' });
    return String(r.translated_text || '').replace(/[؀-ۿ]/g, '').trim();
  } catch {
    return '';
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: 'not allowed' }, 403, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400, origin); }
    const hints = String(body.scene || '').replace(/[؀-ۿ]/g, '').slice(0, 400).trim();
    const arabic = String(body.ar || '').slice(0, 300).trim();
    if (!hints && !arabic) return json({ error: 'empty scene' }, 400, origin);
    const seed = Number.isFinite(body.seed) ? Math.abs(Math.floor(body.seed)) : Math.floor(Math.random() * 1e9);

    try {
      const english = await toEnglish(env, arabic);
      const scene = [hints, english].filter(Boolean).join('. ');
      if (!scene) return json({ error: 'could not understand' }, 422, origin);
      // This model has no seed option; a small variation tag keeps the 4 pictures different.
      const prompt = `${STYLE}. Scene: ${scene}. ${NO_TEXT}. Variation ${seed % 997}.`;
      const out = await env.AI.run(MODEL, { prompt, steps: 4 });
      const bytes = Uint8Array.from(atob(out.image), c => c.charCodeAt(0));
      return new Response(bytes, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store', ...cors(origin) } });
    } catch (e) {
      const msg = String((e && e.message) || e);
      // Daily free allowance used up, or the model is busy.
      const status = /limit|quota|429|neuron|capacity/i.test(msg) ? 429 : 502;
      return json({ error: msg.slice(0, 200) }, status, origin);
    }
  },
};
