// Letter scenes (حرف الباء ...): finds the letter in the teacher's words and draws it.
import { normalize } from './scenes.js';

// Arabic letters: name -> letter, plus a few things that start with it (for the picture).
export const LETTERS = [
  ['ألف', 'أ', 'a rabbit (أرنب), a lion (أسد), a pineapple (أناناس)'],
  ['باء', 'ب', 'a duck (بطة), a cow (بقرة), a watermelon (بطيخ), a door (باب)'],
  ['تاء', 'ت', 'apples (تفاح), a crocodile (تمساح), a crown (تاج)'],
  ['ثاء', 'ث', 'a fox (ثعلب), a bull (ثور), a snowman in snow (ثلج)'],
  ['جيم', 'ج', 'a camel (جمل), a mountain (جبل), carrots (جزر)'],
  ['حاء', 'ح', 'a horse (حصان), a snail (حلزون), a garden (حديقة)'],
  ['خاء', 'خ', 'a sheep (خروف), bread (خبز), a tent (خيمة)'],
  ['دال', 'د', 'a bear (دب), a chicken (دجاجة), a dolphin (دولفين)'],
  ['ذال', 'ذ', 'a fly (ذبابة), corn (ذرة), gold (ذهب)'],
  ['راء', 'ر', 'pomegranates (رمان), a rocket (رائد فضاء), sand (رمل)'],
  ['زاي', 'ز', 'a giraffe (زرافة), olive trees (زيتون), flowers (زهور)'],
  ['سين', 'س', 'a fish (سمكة), a car (سيارة), a ship (سفينة)'],
  ['شين', 'ش', 'a sun (شمس), a tree (شجرة), an umbrella (شمسية)'],
  ['صاد', 'ص', 'a falcon (صقر), seashells (صدف), a rooster (صوص)'],
  ['ضاد', 'ض', 'a frog (ضفدع), a hyena (ضبع), light (ضوء)'],
  ['طاء', 'ط', 'a plane (طيارة), a peacock (طاووس), a drum (طبل)'],
  ['ظاء', 'ظ', 'a deer (ظبي), an envelope (ظرف), shade (ظل)'],
  ['عين', 'ع', 'grapes (عنب), a bird nest (عش), a spider (عنكبوت)'],
  ['غين', 'غ', 'a deer (غزال), clouds (غيوم), a crow (غراب)'],
  ['فاء', 'ف', 'an elephant (فيل), a butterfly (فراشة), strawberries (فراولة)'],
  ['قاف', 'ق', 'a cat (قطة), the moon (قمر), a train (قطار)'],
  ['كاف', 'ك', 'a ball (كرة), a cake (كعكة), a dog (كلب)'],
  ['لام', 'ل', 'lemons (ليمون), a stork (لقلق), toys (لعبة)'],
  ['ميم', 'م', 'bananas (موز), a key (مفتاح), a mosque (مسجد)'],
  ['نون', 'ن', 'a bee (نحلة), a star (نجمة), a tiger (نمر)'],
  ['هاء', 'ه', 'the crescent moon (هلال), a gift (هدية), a hoopoe (هدهد)'],
  ['واو', 'و', 'a rose (وردة), a paper sheet (ورقة), a lion cub (وحيد القرن rhino)'],
  ['ياء', 'ي', 'a hand (يد), a dove (يمامة), a pumpkin (يقطين)'],
];

export function findLetter(text) {
  const t = normalize(text);
  if (!t.includes('حرف')) return null;
  for (const [name, letter] of LETTERS) {
    const n = normalize(name);
    if (t.includes('ال' + n) || t.includes(n)) return LETTERS.find(l => l[1] === letter);
  }
  // "حرف ب"
  const m = (text || '').match(/حرف\s*([ء-ي])(?![ء-ي])/);
  if (m) {
    const ch = m[1] === 'ا' ? 'أ' : m[1];
    return LETTERS.find(l => l[1] === ch) || null;
  }
  return null;
}

// Big letter badge in the corner, e.g. for "حرف الباء".
export function drawLetterBadge(ctx, letter) {
  const F = '"Baloo Bhaijaan 2", "Tajawal", sans-serif';
  ctx.save();
  ctx.translate(190, 200);
  ctx.rotate(-0.08);
  ctx.fillStyle = 'rgba(46,42,79,.25)';
  ctx.beginPath(); ctx.arc(6, 10, 135, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0, 0, 135, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = '#FFC83D'; ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = '#6C5CE7'; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.arc(0, 0, 112, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.fillStyle = '#6C5CE7';
  ctx.font = `700 150px ${F}`;
  ctx.fillText(letter, 0, 6);
  ctx.restore();
  // little forms of the letter: بـ ـبـ ـب
  if (!'أاإآدذرزوءة'.includes(letter)) {
    ctx.save();
    ctx.translate(190, 372);
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-120, -32, 240, 64, 32) : ctx.rect(-120, -32, 240, 64); ctx.fill();
    ctx.fillStyle = '#E0464B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    ctx.font = `700 40px ${F}`;
    ctx.fillText(`${letter}ـ  ـ${letter}ـ  ـ${letter}`, 0, 4);
    ctx.restore();
  }
}

// ---------- Ready prompt for Gemini / ChatGPT ----------
// The teacher speaks or types in Arabic; we add English words so any picture AI
// understands, plus the style rules that make it fit the app.
const WORDS = [
  ['قطف', 'harvest season'], ['زيتون', 'olive trees full of green and black olives, olive harvest season in Jordan'],
  ['بحر', 'the sea'], ['شط', 'a sandy beach'], ['فراش', 'colorful butterflies'], ['حديقه', 'a flower garden'],
  ['ملعب', 'a kids playground'], ['مزرعه', 'a farm with a red barn'], ['حيوانات', 'cute animals'],
  ['مطر', 'a rainy day with puddles, umbrellas and a rainbow'], ['ثلج', 'a snowy winter day'], ['شتاء', 'winter'],
  ['صيف', 'a sunny summer day'], ['ربيع', 'spring with flowers'], ['خريف', 'autumn leaves'], ['ورد', 'flowers'],
  ['شجر', 'trees'], ['تفاح', 'an apple orchard'], ['برتقال', 'orange trees'], ['عنب', 'grape vines'],
  ['قمح', 'a golden wheat field'], ['جبل', 'mountains'], ['نهر', 'a river'], ['سفينه', 'a ship'], ['قطار', 'a toy train'],
  ['طياره', 'an airplane in the sky'], ['مدرسه', 'a school building'], ['روضه', 'a kindergarten'], ['صف', 'a colorful classroom'],
  ['مكتبه', 'a library full of books'], ['كتب', 'books'], ['العاب', 'toys'], ['مسجد', 'a mosque'], ['قمر', 'the moon'],
  ['شمس', 'the sun'], ['نجوم', 'stars'], ['غيوم', 'clouds'], ['قوس قزح', 'a rainbow'], ['عيد', 'Eid celebration with lights and gifts'],
  ['رمضان', 'Ramadan lanterns and a crescent moon'], ['بترا', 'Petra, Jordan'], ['البتراء', 'Petra, Jordan'],
  ['وادي رم', 'Wadi Rum desert, Jordan'], ['البحر الميت', 'the Dead Sea, Jordan'], ['عجلون', 'Ajloun forest, Jordan'],
  ['عمان', 'Amman city, Jordan'], ['مطبخ', 'a kitchen'], ['خضار', 'vegetables'], ['فواكه', 'fruits'], ['نحل', 'bees and honey'],
  ['دجاج', 'chickens'], ['خراف', 'sheep'], ['قطه', 'kittens'], ['سمك', 'fish'], ['ديناصور', 'dinosaurs'], ['فضاء', 'outer space'],
  ['اطفاء', 'a fire station'], ['مستشفى', 'a hospital'], ['سوق', 'a market'], ['خبز', 'a bakery'], ['اسنان', 'happy teeth and toothbrushes'],
  ['زراعه', 'planting seeds in a garden'], ['غابه', 'a forest'], ['صحراء', 'a desert'], ['جمل', 'camels'], ['حصان', 'horses'],
  ['بطه', 'ducks in a pond'], ['ارنب', 'rabbits'], ['فيل', 'elephants'], ['اسد', 'lions'], ['زرافه', 'giraffes'],
  ['حفله', 'a party'], ['ميلاد', 'a birthday party with cake and balloons'], ['تخرج', 'a graduation ceremony'],
  ['امتحان', 'a school desk with exam papers and pencils'], ['رسم', 'painting with crayons'], ['الوان', 'colors and paints'],
  ['موسيقى', 'musical instruments'], ['رياضه', 'sports'], ['كره', 'football'], ['سباحه', 'a swimming pool'],
];

export function buildImagePrompt(desc) {
  const t = normalize(desc);
  const letter = findLetter(desc);
  const en = [];
  for (const [ar, e] of WORDS) if (t.includes(normalize(ar))) en.push(e);
  let scene;
  if (letter) scene = `a cheerful scene full of things whose Arabic names start with the letter ${letter[1]}: ${letter[2]}`;
  else scene = en.length ? en.join(', ') : 'see the Arabic description';
  return [
    'Create one square (1:1) background picture for a kindergarten encouragement card.',
    `Scene: ${scene}.`,
    `Teacher's description in Arabic: "${desc}".`,
    'Style: cute flat children\'s book illustration, bright soft pastel colors, cheerful and warm, simple shapes.',
    'Leave the lower middle of the picture fairly empty, because a child\'s photo will be placed there.',
    'Do not draw any people or children. Do not write any text, letters, numbers or logos.',
  ].join('\n');
}

// ---------- Our own drawing server (Cloudflare Worker) ----------
// Set to the server address once it is deployed; empty means "not available yet".
export const DRAW_URL = 'https://najmi-draw.nansi3000a.workers.dev';

export function sceneForAI(desc) {
  const t = normalize(desc);
  const letter = findLetter(desc);
  const en = [];
  for (const [ar, e] of WORDS) if (t.includes(normalize(ar))) en.push(e);
  if (letter) return { scene: letter[2].replace(/\s*\([^)]*\)/g, ''), ar: '' };
  // English hints we know, plus the Arabic description (the server translates it).
  return { scene: en.join(', '), ar: desc };
}

export async function drawWithAI(desc, seed) {
  const res = await fetch(DRAW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...sceneForAI(desc), seed }),
  });
  if (res.status === 429) throw new Error('limit');
  if (!res.ok) throw new Error('fail');
  return res.blob();
}
