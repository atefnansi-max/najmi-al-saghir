import * as db from './db.js';
import { BEHAVIORS, phrasesFor, behaviorLabel, parentMessage } from './phrases.js';
import { getScenes, getScene, sceneURL, matchScene, normalize, ACCESSORIES } from './scenes.js';
import { shrink, smartCutout, circleSticker } from './cutout.js';
import { compose, fontsReady, canvasBlob } from './compose.js';
import { listen, voiceSupported } from './voice.js';
import { shareImage, openWhatsApp, openFacebook, downloadBlob, canShareFiles } from './share.js';

const view = document.getElementById('view');
const fab = document.getElementById('fab');
const WEEK = 7 * 24 * 60 * 60 * 1000;

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = view) => root.querySelector(sel);
const $$ = (sel, root = view) => [...root.querySelectorAll(sel)];
const urls = new Map();
function blobURL(key, blob) {
  if (!blob) return '';
  const old = urls.get(key);
  if (old && old.blob === blob) return old.url;
  if (old) URL.revokeObjectURL(old.url);
  const url = URL.createObjectURL(blob);
  urls.set(key, { blob, url });
  return url;
}

let toastTimer;
export function toast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function celebrate() {
  const box = document.createElement('div');
  box.className = 'celebrate';
  const items = ['⭐', '🌟', '✨', '💛', '⭐', '🎉'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    s.textContent = items[i % items.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * 0.5 + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2400);
}

function avatarHTML(st, extra = '') {
  const src = st.photo ? blobURL('p-' + st.id, st.photo) : '';
  return `<span class="avatar ${extra}">${src ? `<img src="${src}" alt="">` : esc(st.name.slice(0, 1))}</span>`;
}

const isGirl = st => st.gender === 'f';
const recent = (stars, id) => stars.some(s => s.studentId === id && Date.now() - s.createdAt < WEEK);
const weekCount = (stars, id) => stars.filter(s => s.studentId === id && Date.now() - s.createdAt < WEEK).length;

// ---------- router ----------
const routes = { home, student, kid, make, settings };
function go(hash) { location.hash = hash; }
async function route() {
  const [name, arg] = location.hash.replace(/^#\/?/, '').split('/');
  view.className = '';
  fab.classList.toggle('hidden', !name || ['home', 'make', 'student'].includes(name));
  await (routes[name] || home)(arg ? decodeURIComponent(arg) : undefined);
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go); }
});
fab.addEventListener('click', () => go('make'));

// ---------- HOME ----------
async function home() {
  const [students, stars] = await Promise.all([db.getStudents(), db.getAllStars()]);
  const s = db.getSettings();
  if (!students.length) {
    view.innerHTML = `
      <div class="card empty">
        <div class="big">🌟</div>
        <h1>أهلا وسهلا فيكِ!</h1>
        <p class="muted">أول إشي، ضيفي ولاد صفّك. كل طفل بتضيفيه مرة وحدة بس.</p>
        <button class="btn primary block" data-go="student">➕ ضيفي أول طفل</button>
        <p class="note" style="margin-top:14px">🔒 الصور بتضل على جهازك، وما بتطلع لأي مكان.</p>
      </div>`;
    return;
  }
  const waiting = students.filter(st => !recent(stars, st.id));
  const weekTotal = stars.filter(x => Date.now() - x.createdAt < WEEK).length;
  view.innerHTML = `
    <div class="hello">
      <div>
        <h1>${esc(s.className)} ${esc(s.classEmoji)}</h1>
        <p class="muted" style="margin:0">${weekTotal ? `هالأسبوع زرعتِ ${weekTotal} ${weekTotal === 1 ? 'نجمة' : 'نجوم'} بقلوب ولادك 💛` : 'يلا نبلّش أول نجمة هالأسبوع ⭐'}</p>
      </div>
    </div>
    ${waiting.length && waiting.length < students.length ? `
      <button class="nudge" style="border:0;width:100%;text-align:start" data-go="make/${esc(waiting[0].id)}">
        <span class="faces">${waiting.slice(0, 3).map(st => avatarHTML(st)).join('')}</span>
        <span><b>${waiting.slice(0, 3).map(st => esc(st.name)).join('، ')}</b> ${waiting.length > 3 ? `و${waiting.length - 3} كمان` : ''}<br><small>صرلهم فترة بلا نجمة هالأسبوع</small></span>
      </button>` : ''}
    <div class="card">
      <div class="kids">
        ${students.map(st => `
          <button class="kid" data-go="kid/${esc(st.id)}">
            ${avatarHTML(st, recent(stars, st.id) ? '' : 'empty-week')}
            <span>${esc(st.name)}</span>
            <span class="count">${weekCount(stars, st.id) ? '⭐'.repeat(Math.min(5, weekCount(stars, st.id))) : 'لسّا'}</span>
          </button>`).join('')}
        <button class="kid add" data-go="student"><span class="avatar">+</span><span>طفل جديد</span></button>
      </div>
    </div>
    <button class="btn primary block" data-go="make">⭐ اعملي نجمة</button>`;
}

// ---------- ADD / EDIT STUDENT ----------
async function student(id) {
  const existing = id ? await db.getStudent(id) : null;
  const st = existing || { id: db.uid(), name: '', gender: 'm', phone: '', consentPhoto: false, consentFb: false, createdAt: Date.now() };
  let photo = st.photo || null;
  let sticker = st.sticker || null;
  let stickerKind = st.stickerKind || 'smart';

  view.innerHTML = `
    <button class="btn ghost small" data-go="${existing ? 'kid/' + esc(st.id) : 'home'}">→ رجوع</button>
    <h1 style="margin:6px 0 14px">${existing ? `تعديل ${esc(st.name)}` : 'طفل جديد'}</h1>
    <form id="f" class="card" novalidate>
      <div class="photo-pick">
        <div class="preview" id="pv">${sticker ? `<img src="${blobURL('s-' + st.id, sticker)}" alt="">` : '📷'}</div>
        <div class="status" id="status">${sticker ? 'الستيكر جاهز ✨' : 'صورة واضحة للطفل، ويفضّل وجهه وجسمه'}</div>
        <div class="progress hidden" id="prog"><i></i></div>
        <div class="row">
          <label class="btn small primary">📸 صوّري هسّا<input type="file" accept="image/*" capture="user" id="cam" hidden></label>
          <label class="btn small">🖼️ من الصور<input type="file" accept="image/*" id="gal" hidden></label>
        </div>
        <div class="row ${photo ? '' : 'hidden'}" id="kindRow">
          <button type="button" class="btn small" id="kSmart">✂️ قصّ ذكي</button>
          <button type="button" class="btn small" id="kCircle">⭕ دائرة</button>
        </div>
      </div>
      <label class="field"><span>اسم الطفل</span><input class="input" id="name" value="${esc(st.name)}" placeholder="ليان" autocomplete="off" required></label>
      <div class="field"><span>ولد ولا بنت؟</span>
        <div class="seg">
          <label><input type="radio" name="g" value="m" ${st.gender !== 'f' ? 'checked' : ''}><span>👦 ولد</span></label>
          <label><input type="radio" name="g" value="f" ${st.gender === 'f' ? 'checked' : ''}><span>👧 بنت</span></label>
        </div>
      </div>
      <label class="field"><span>رقم واتساب الأهل</span><input class="input" id="phone" type="tel" inputmode="tel" dir="ltr" style="text-align:right" value="${esc(st.phone)}" placeholder="0791234567"></label>
      <label class="check"><input type="checkbox" id="cP" ${st.consentPhoto ? 'checked' : ''}><span>الأهل موافقين نستخدم صورة الطفل بالنجوم</span></label>
      <label class="check fbc"><input type="checkbox" id="cF" ${st.consentFb ? 'checked' : ''}><span>الأهل موافقين ننشر صوره على فيسبوك الروضة</span></label>
      <p id="err" class="status hidden" style="color:var(--coral-ink)"></p>
      <button class="btn primary block" type="submit">💾 احفظي</button>
      ${existing ? `<button type="button" class="btn ghost block" id="del" style="margin-top:8px">🗑️ احذفي الطفل</button>` : ''}
    </form>`;

  const status = $('#status'), prog = $('#prog'), pv = $('#pv');
  const setStatus = t => { status.textContent = t; };

  async function buildSticker(kind) {
    if (!photo) return;
    stickerKind = kind;
    if (kind === 'circle') {
      sticker = await circleSticker(photo);
      showSticker('الستيكر جاهز ⭕');
      return;
    }
    setStatus('لحظة، عم نقصّ الصورة... (أول مرة بتاخد شوي)');
    prog.classList.remove('hidden');
    const bar = prog.firstElementChild;
    try {
      sticker = await smartCutout(photo, p => { bar.style.width = Math.round(p * 100) + '%'; });
      showSticker('الستيكر جاهز ✨');
    } catch (e) {
      console.warn('cutout failed', e);
      stickerKind = 'circle';
      sticker = await circleSticker(photo);
      showSticker('ما زبط القصّ الذكي، عملناه دائرة ⭕');
    } finally {
      prog.classList.add('hidden');
    }
  }
  function showSticker(msg) {
    pv.innerHTML = `<img src="${blobURL('s-' + st.id, sticker)}" alt="">`;
    setStatus(msg);
  }
  async function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      photo = await shrink(f);
    } catch {
      setStatus('ما قدرنا نفتح الصورة. جرّبي صورة تانية.');
      return;
    }
    $('#kindRow').classList.remove('hidden');
    pv.innerHTML = `<img src="${blobURL('p-' + st.id, photo)}" alt="">`;
    buildSticker('smart');
  }
  $('#cam').addEventListener('change', onFile);
  $('#gal').addEventListener('change', onFile);
  $('#kSmart').addEventListener('click', () => buildSticker('smart'));
  $('#kCircle').addEventListener('click', () => buildSticker('circle'));

  $('#f').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#err');
    const name = $('#name').value.trim();
    if (!name) { err.textContent = 'اكتبي اسم الطفل'; err.classList.remove('hidden'); $('#name').focus(); return; }
    if (!$('#cP').checked && photo) { err.textContent = 'لازم موافقة الأهل قبل ما نستخدم صورة الطفل'; err.classList.remove('hidden'); return; }
    Object.assign(st, {
      name,
      gender: $('input[name="g"]:checked').value,
      phone: $('#phone').value.trim(),
      consentPhoto: $('#cP').checked,
      consentFb: $('#cF').checked,
      photo, sticker, stickerKind,
    });
    await db.saveStudent(st);
    toast(existing ? 'انحفظ ✅' : `${name} صار بالصف 🎉`);
    go(existing ? 'kid/' + st.id : 'home');
  });
  ['#name', '#cP'].forEach(sel => $(sel).addEventListener('input', () => $('#err').classList.add('hidden')));
  $('#del')?.addEventListener('click', async () => {
    if (!confirm(`أكيد بدك تحذفي ${st.name} وكل نجومه؟`)) return;
    await db.deleteStudent(st.id);
    toast('انحذف');
    go('home');
  });
}

// ---------- CHILD PROFILE + ARCHIVE ----------
async function kid(id) {
  const st = await db.getStudent(id);
  if (!st) return go('home');
  const stars = (await db.getStarsFor(id)).sort((a, b) => b.createdAt - a.createdAt);
  view.innerHTML = `
    <button class="btn ghost small" data-go="home">→ رجوع</button>
    <div class="profile">
      ${avatarHTML(st)}
      <div>
        <h1>${esc(st.name)}</h1>
        <p class="muted" style="margin:0">${stars.length ? `${stars.length} ${stars.length === 1 ? 'نجمة' : 'نجوم'} لحد هسّا ⭐` : 'لسّا ما أخد نجوم'}</p>
      </div>
    </div>
    <div class="actions" style="margin-bottom:16px">
      <button class="btn primary" data-go="make/${esc(st.id)}">⭐ نجمة ل${esc(st.name)}</button>
      <button class="btn" data-go="student/${esc(st.id)}">✏️ تعديل</button>
    </div>
    ${stars.length ? `<div class="gallery">${stars.map(x => `
      <figure><a href="${blobURL('st-' + x.id, x.image)}" target="_blank" rel="noopener"><img src="${blobURL('st-' + x.id, x.image)}" alt="${esc(x.phrase)}" loading="lazy"></a>
      <figcaption>${new Date(x.createdAt).toLocaleDateString('ar-JO', { day: 'numeric', month: 'long' })}</figcaption></figure>`).join('')}</div>`
    : `<div class="card empty"><div class="big">🌱</div><p class="muted">أول نجمة ل${esc(st.name)} رح تطلع هون.</p></div>`}`;
}

// ---------- SETTINGS ----------
async function settings() {
  const s = db.getSettings();
  view.innerHTML = `
    <button class="btn ghost small" data-go="home">→ رجوع</button>
    <h1 style="margin:6px 0 14px">الإعدادات</h1>
    <form id="sf" class="card">
      <label class="field"><span>اسمك (بيطلع برسالة الأهل)</span><input class="input" id="t" value="${esc(s.teacher)}" placeholder="أسماء"></label>
      <label class="field"><span>اسم الصف</span><input class="input" id="c" value="${esc(s.className)}" placeholder="صف الفراشات"></label>
      <label class="field"><span>رمز الصف</span><input class="input" id="e" value="${esc(s.classEmoji)}" maxlength="4" placeholder="🦋"></label>
      <label class="field"><span>اسم الروضة (اختياري)</span><input class="input" id="k" value="${esc(s.kg)}" placeholder="روضة الأمل"></label>
      <button class="btn primary block">💾 احفظي</button>
    </form>
    <p class="note">🔒 كل الصور والأسماء محفوظة على هالجهاز بس.</p>`;
  $('#sf').addEventListener('submit', e => {
    e.preventDefault();
    db.saveSettings({ teacher: $('#t').value.trim(), className: $('#c').value.trim() || 'صفّي', classEmoji: $('#e').value.trim(), kg: $('#k').value.trim() });
    toast('انحفظ ✅');
    go('home');
  });
}

// ---------- MAKE A STAR ----------
async function make(preId) {
  const students = await db.getStudents();
  if (!students.length) { toast('ضيفي طفل أول 😊'); return go('student'); }
  const cfg = db.getSettings();
  view.className = 'wide';

  const state = {
    kids: preId && students.some(x => x.id === preId) ? [preId] : [],
    behavior: null,
    sceneId: 'space',
    magic: null,          // { url } when the teacher asked for a new scene from her words
    acc: 'stars',
    phrase: '',
    story: '',
    phraseIdx: 0,
    accTouched: false,
    sceneTouched: false,
  };

  view.innerHTML = `
    <div class="maker">
      <div class="preview-col">
        <div class="canvas-wrap"><canvas id="cv" width="1080" height="1080" aria-label="صورة النجمة"></canvas><div class="busy hidden" id="busy">لحظة، عم نجهّز النجمة... ⭐</div></div>
        <div class="send-row" style="margin-top:14px">
          <button class="btn mint block" id="wa">📲 ابعتي لأهله على واتساب</button>
          <div class="two">
            <button class="btn fb" id="fb">📘 فيسبوك</button>
            <button class="btn" id="save">💾 احفظي</button>
          </div>
          <p class="note" id="sendNote"></p>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="step-title"><span class="num">1</span><h3>مين النجم؟</h3></div>
          <div class="strip" id="kidStrip">
            ${students.map(st => `<button class="chip-kid" data-kid="${esc(st.id)}" aria-pressed="false">${avatarHTML(st)}<span>${esc(st.name)}</span></button>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="step-title"><span class="num">2</span><h3>احكيلي شو صار</h3></div>
          <div class="mic-row">
            <button class="mic" id="mic" aria-label="احكي">🎤</button>
            <div class="heard" id="heard">${voiceSupported ? 'اكبسي على المايك واحكي، مثلاً: "ليان ساعدت صاحبتها، بدي ياها بالفضاء"' : 'اكتبي شو صار تحت 👇'}</div>
          </div>
          <textarea class="input" id="story" style="margin-top:10px;min-height:60px" placeholder="أو اكتبي هون: أحمد رتّب ألعابه"></textarea>
          <p class="muted" style="margin:12px 0 8px;font-size:15px">أو اختاري بسرعة:</p>
          <div class="chips" id="chips">
            ${BEHAVIORS.map(b => `<button class="chip ${b.color}" data-b="${b.id}" aria-pressed="false">${esc(b.label)}</button>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="step-title"><span class="num">3</span><h3>وين بدك ياه؟</h3></div>
          <div class="strip" id="sceneStrip">
            ${getScenes().map(sc => `<button class="scene-btn" data-scene="${sc.id}" aria-pressed="false"><img src="${sceneURL(sc)}" alt=""><span>${sc.emoji} ${esc(sc.name)}</span></button>`).join('')}
            <button class="scene-btn magic" id="magicBtn"><b>🪄</b><span>مشهد من وصفك</span></button>
          </div>
          <p class="muted" style="margin:10px 0 8px;font-size:15px">زينة:</p>
          <div class="strip" id="accStrip">
            ${ACCESSORIES.map(a => `<button class="acc-btn" data-acc="${a.id}" aria-pressed="false" aria-label="${esc(a.name)}" title="${esc(a.name)}">${a.emoji}</button>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="step-title"><span class="num">4</span><h3>جملة التشجيع</h3></div>
          <div class="phrase-row">
            <textarea class="input" id="phrase" rows="2"></textarea>
            <button class="btn small" id="shuffle" aria-label="جملة تانية" title="جملة تانية">🔄</button>
          </div>
        </div>
      </div>
    </div>`;

  const cv = $('#cv');
  const busy = $('#busy');
  await fontsReady();

  const picked = () => state.kids.map(id => students.find(s => s.id === id)).filter(Boolean);

  function refreshPhrase(force) {
    const ks = picked();
    if (!ks.length) { state.phrase = ''; $('#phrase').value = ''; return; }
    if (!force && $('#phrase').dataset.edited === '1') return;
    const names = ks.map(k => k.name).join(' و');
    const girl = ks.length === 1 ? isGirl(ks[0]) : ks.every(isGirl);
    const list = phrasesFor(state.behavior || 'general', names, girl, ks.length > 1);
    state.phrase = list[state.phraseIdx % list.length];
    $('#phrase').value = state.phrase;
    $('#phrase').dataset.edited = '0';
  }

  function syncUI() {
    $$('#kidStrip [data-kid]').forEach(b => b.setAttribute('aria-pressed', state.kids.includes(b.dataset.kid)));
    $$('#chips [data-b]').forEach(b => b.setAttribute('aria-pressed', b.dataset.b === state.behavior));
    $$('#sceneStrip [data-scene]').forEach(b => b.setAttribute('aria-pressed', !state.magic && b.dataset.scene === state.sceneId));
    $('#magicBtn').setAttribute('aria-pressed', !!state.magic);
    $$('#accStrip [data-acc]').forEach(b => b.setAttribute('aria-pressed', b.dataset.acc === state.acc));
    const ks = picked();
    const one = ks.length === 1 ? ks[0] : null;
    $('#wa').textContent = one ? `📲 ابعتي ل${isGirl(one) ? 'أهلها' : 'أهله'} على واتساب` : '📲 ابعتي للأهل على واتساب';
    const fbOK = ks.length && ks.every(k => k.consentFb);
    $('#fb').disabled = !fbOK;
    $('#sendNote').textContent = ks.length && !fbOK ? 'فيسبوك مسكّر لأنو الأهل ما وافقوا على النشر' : '';
  }

  let drawToken = 0;
  async function draw() {
    const token = ++drawToken;
    const ks = picked();
    const scene = getScene(state.sceneId);
    busy.classList.remove('hidden');
    try {
      await compose(cv, {
        bgURL: state.magic ? state.magic.url : sceneURL(scene),
        bgCors: !!state.magic,
        decorate: state.magic ? null : scene.decorate,
        stickers: ks.map(k => k.sticker).filter(Boolean),
        acc: ks.length ? state.acc : 'none',
        phrase: ks.length ? $('#phrase').value.trim() : 'اختاري الطفل لنبلّش ⭐',
        tag: `⭐ نجمي الصغير${cfg.className ? ' · ' + cfg.className : ''}`,
      });
    } catch (e) {
      console.warn(e);
      if (state.magic) {
        toast('ما زبط المشهد السحري، رجعنا للمشهد الجاهز');
        state.magic = null;
        syncUI();
        return draw();
      }
    } finally {
      if (token === drawToken) busy.classList.add('hidden');
    }
  }

  function setScene(id, byTeacher) {
    state.sceneId = id;
    state.magic = null;
    if (byTeacher) state.sceneTouched = true;
    if (!state.accTouched) state.acc = getScene(id).acc;
  }

  function setBehavior(id) {
    state.behavior = id;
    state.phraseIdx = 0;
    const b = BEHAVIORS.find(x => x.id === id);
    if (b && !state.sceneTouched) setScene(b.scene, false);
  }

  // Understand what the teacher said or typed.
  function understand(text) {
    state.story = text;
    const t = normalize(text);
    const foundKids = students.filter(st => t.includes(normalize(st.name)));
    if (foundKids.length) state.kids = foundKids.map(k => k.id);
    const b = BEHAVIORS.find(x => x.words.some(w => t.includes(normalize(w))));
    if (b) setBehavior(b.id);
    const sc = matchScene(text);
    if (sc) setScene(sc.id, true);
    $('#phrase').dataset.edited = '0';
    refreshPhrase(true);
    syncUI();
    draw();
  }

  // --- events ---
  $('#kidStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-kid]');
    if (!b) return;
    const id = b.dataset.kid;
    state.kids = state.kids.includes(id) ? state.kids.filter(x => x !== id) : [...state.kids, id];
    refreshPhrase(true); syncUI(); draw();
  });
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('[data-b]');
    if (!b) return;
    setBehavior(b.dataset.b);
    refreshPhrase(true); syncUI(); draw();
  });
  $('#sceneStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-scene]');
    if (!b) return;
    setScene(b.dataset.scene, true);
    syncUI(); draw();
  });
  $('#accStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-acc]');
    if (!b) return;
    state.acc = b.dataset.acc; state.accTouched = true;
    syncUI(); draw();
  });
  $('#shuffle').addEventListener('click', () => { state.phraseIdx++; refreshPhrase(true); draw(); });
  let typeTimer;
  $('#phrase').addEventListener('input', () => {
    $('#phrase').dataset.edited = '1';
    clearTimeout(typeTimer); typeTimer = setTimeout(draw, 350);
  });
  let storyTimer;
  $('#story').addEventListener('input', () => {
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => understand($('#story').value), 600);
  });

  // Voice
  let rec = null;
  $('#mic').addEventListener('click', () => {
    if (!voiceSupported) { toast('المايك مش شغّال بهالمتصفح، استخدمي Chrome أو اكتبي'); $('#story').focus(); return; }
    if (rec) { rec.stop(); return; }
    $('#mic').classList.add('on');
    $('#heard').textContent = 'عم بسمعك... 👂';
    rec = listen({
      onText: t => { $('#heard').textContent = t || 'عم بسمعك... 👂'; },
      onEnd: t => {
        rec = null;
        $('#mic').classList.remove('on');
        if (t) { $('#heard').textContent = `"${t}"`; $('#story').value = t; understand(t); }
        else $('#heard').textContent = 'ما سمعت إشي، جرّبي كمان مرة 🎤';
      },
      onError: err => {
        rec = null;
        $('#mic').classList.remove('on');
        $('#heard').textContent = err === 'not-allowed' ? 'لازم تسمحي للمايك من المتصفح 🎤' : 'ما زبط، جرّبي كمان مرة أو اكتبي 👇';
      },
    });
  });

  // Magic scene from the teacher's words (only the description is sent, never names or photos).
  $('#magicBtn').addEventListener('click', () => {
    let desc = ($('#story').value || '').trim();
    students.forEach(st => { desc = desc.split(st.name).join(''); });
    desc = desc.replace(/\s+/g, ' ').trim();
    if (!desc) { toast('احكي أو اكتبي وصف المشهد أول، مثلاً: حديقة فيها فراشات وقوس قزح'); $('#story').focus(); return; }
    const prompt = `cute flat children's book illustration background, bright soft pastel colors, no people, no text, empty space in the center, scene: ${desc}`;
    const seed = Math.floor(Math.random() * 1e6);
    state.magic = { url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&nologo=true&seed=${seed}` };
    syncUI(); draw();
    toast('عم نرسم مشهد جديد من وصفك... 🪄 (ممكن ياخد ثواني)', 4000);
  });

  // Sending
  async function finalImage() {
    const ks = picked();
    if (!ks.length) { toast('اختاري الطفل أول 😊'); return null; }
    if (ks.some(k => !k.sticker)) toast('في طفل بلا صورة، ضيفيله صورة من صفحته');
    let blob;
    try { blob = await canvasBlob(cv); }
    catch { toast('ما قدرنا نحفظ الصورة، جرّبي مشهد جاهز'); return null; }
    const createdAt = Date.now();
    for (const k of ks) {
      await db.saveStar({ id: db.uid(), studentId: k.id, createdAt, behavior: state.behavior, scene: state.magic ? 'magic' : state.sceneId, phrase: $('#phrase').value.trim(), image: blob });
    }
    return { blob, ks };
  }

  let saved = null;
  const ensure = async () => (saved ||= await finalImage());
  // Any change after saving means a new picture.
  view.addEventListener('click', e => { if (e.target.closest('#kidStrip,#chips,#sceneStrip,#accStrip,#shuffle,#magicBtn')) saved = null; }, true);
  $('#phrase').addEventListener('input', () => { saved = null; });

  $('#wa').addEventListener('click', async () => {
    const r = await ensure(); if (!r) return;
    const k = r.ks[0];
    const msg = parentMessage({ name: k.name, isGirl: isGirl(k), story: state.story && state.story.length < 160 ? state.story : '', settings: cfg });
    const file = new File([r.blob], `najmi-${Date.now()}.jpg`, { type: 'image/jpeg' });
    if (canShareFiles(file)) {
      const ok = await shareImage(file, msg);
      if (ok) { celebrate(); toast('وصلت! يعطيكِ العافية 💛'); }
    } else {
      downloadBlob(r.blob, file.name);
      openWhatsApp(k.phone, msg);
      celebrate();
      toast('الصورة نزلت على جهازك، ضيفيها بمحادثة الواتساب 📎', 5000);
    }
  });
  $('#fb').addEventListener('click', async () => {
    const r = await ensure(); if (!r) return;
    const file = new File([r.blob], `najmi-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const text = $('#phrase').value.trim();
    if (canShareFiles(file)) {
      if (await shareImage(file, text)) { celebrate(); toast('يعطيكِ العافية 💛'); }
    } else {
      downloadBlob(r.blob, file.name);
      openFacebook();
      toast('الصورة نزلت، ارفعيها على فيسبوك 📘', 5000);
    }
  });
  $('#save').addEventListener('click', async () => {
    const r = await ensure(); if (!r) return;
    downloadBlob(r.blob, `najmi-${Date.now()}.jpg`);
    celebrate();
    toast('انحفظت بأرشيف الطفل وعلى جهازك ⭐');
  });

  // first paint
  if (state.kids.length) {
    const k = picked()[0];
    state.acc = getScene(state.sceneId).acc;
    refreshPhrase(true);
    if (!k.sticker) toast(`${k.name} لسّا ما إلو صورة، ضيفيها من صفحته 📷`, 4000);
  } else {
    state.acc = getScene(state.sceneId).acc;
  }
  syncUI();
  draw();
}

route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
