// Draws the final star picture: scene + child sticker(s) + accessory + phrase banner.
import { blobToImage } from './cutout.js';

const S = 1080;
const BANNER_TOP = 880;

function loadURL(url, cors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('load'));
    img.src = url;
  });
}

export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load('700 48px "Baloo Bhaijaan 2"', 'نجمي'),
      document.fonts.load('500 28px "Tajawal"', 'نجمي'),
    ]);
  } catch { /* fall back to system fonts */ }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{bgURL:string, bgCors?:boolean, stickers:Blob[], acc:string, phrase:string, tag:string}} o
 */
export async function compose(canvas, o) {
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, S, S);

  const bg = await loadURL(o.bgURL, o.bgCors);
  const s = Math.max(S / bg.width, S / bg.height);
  ctx.drawImage(bg, (S - bg.width * s) / 2, (S - bg.height * s) / 2, bg.width * s, bg.height * s);
  if (o.overlayURL) ctx.drawImage(await loadURL(o.overlayURL), 0, 0, S, S);
  if (o.decorate) o.decorate(ctx);

  const imgs = await Promise.all((o.stickers || []).map(blobToImage));
  const realPaper = o.acc === 'paper' && (o.paperStyle || 'chest') === 'real' ? await realPaperImage() : null;
  const n = imgs.length;
  const paper = o.acc === 'paper';
  // No text on the picture: the children can use the space where the banner was.
  const base = o.phrase ? BANNER_TOP : S - 90;
  const pStyle = o.paperStyle || 'chest';
  const maxH = paper ? (n > 2 ? 330 : n === 2 ? 410 : pStyle === 'side' ? 560 : 470) : (n > 2 ? 420 : n === 2 ? 520 : 600);
  const maxW = n > 2 ? 320 : n === 2 ? 420 : 560;
  const gap = 20;
  const boxes = [];
  if (n <= 3) {
    // One row
    const sizes = imgs.map(im => {
      const k = Math.min(maxH / im.height, maxW / im.width);
      return { w: im.width * k, h: im.height * k };
    });
    const total = sizes.reduce((a, b) => a + b.w, 0) + gap * (n - 1);
    let x = (S - total) / 2;
    imgs.forEach((im, i) => {
      const { w, h } = sizes[i];
      let y = base + 30 - h;
      if (paper) {
        // Lift the child so the paper in their hands sits fully above the text box.
        const g = paperGeom(pStyle, { x: 0, y: 0, w, h });
        y = Math.min(y, base - 14 - g.bottom);
      } else {
        ctx.fillStyle = 'rgba(46,42,79,.18)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, base + 26, w * 0.42, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      boxes.push({ x, y, w, h });
      x += w + gap;
    });
  } else {
    // Whole class: rows, like a class photo
    const top = 100, bottom = base + 24;
    const cols = Math.ceil(Math.sqrt(n * 1.25));
    const rows = Math.ceil(n / cols);
    const cellW = (S - 40) / cols, cellH = (bottom - top) / rows;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      const m = Math.min(cols, n - i);
      const rowX = (S - m * cellW) / 2;
      for (let c = 0; c < m; c++, i++) {
        const im = imgs[i];
        const lim = paper ? cellH * 0.7 : cellH * 0.96;
        const k = Math.min(lim / im.height, (cellW * 0.94) / im.width);
        let w = im.width * k, h = im.height * k;
        let full = paper ? paperGeom(pStyle, { x: 0, y: 0, w, h }).bottom : h;
        // Child plus paper must fit inside its own row, so nobody's paper covers a face below.
        if (full > cellH * 0.98) { const f = (cellH * 0.98) / full; w *= f; h *= f; full *= f; }
        boxes.push({ x: rowX + c * cellW + (cellW - w) / 2, y: top + r * cellH + (cellH - full), w, h });
      }
    }
  }
  boxes.forEach((b, i) => ctx.drawImage(imgs[i], b.x, b.y, b.w, b.h));

  boxes.forEach((b, i) => {
    if (o.acc === 'paper') drawHeldPaper(ctx, b, imgs[i], (o.names || [])[i] || '', o.paperStyle || 'chest', realPaper);
    else drawAccessory(ctx, o.acc, b, i);
  });
  if (o.phrase) drawBanner(ctx, o.phrase);
  if (o.tag) drawTag(ctx, o.tag);
}

function star(ctx, cx, cy, r, fill, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx[i ? 'lineTo' : 'moveTo'](rr * Math.cos(a), rr * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = r * 0.16; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

function heart(ctx, cx, cy, r, fill) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(-r * 1.2, -r * 0.5, -r * 0.4, -r * 1.2, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.4, -r * 1.2, r * 1.2, -r * 0.5, 0, r * 0.35);
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.restore();
}

function drawAccessory(ctx, acc, b, i) {
  const cx = b.x + b.w / 2;
  const unit = Math.min(b.w, b.h);
  if (acc === 'crown') {
    const w = unit * 0.42, h = w * 0.55, top = b.y - h * 0.55;
    ctx.save();
    ctx.translate(cx, top); ctx.rotate(-0.08);
    ctx.beginPath();
    ctx.moveTo(-w / 2, h); ctx.lineTo(-w / 2, 0); ctx.lineTo(-w / 4, h * 0.45);
    ctx.lineTo(0, -h * 0.15); ctx.lineTo(w / 4, h * 0.45); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.closePath();
    ctx.fillStyle = '#FFC83D'; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.stroke();
    ['#FF7A6B', '#4DB6FF', '#2EC4A0'].forEach((c, k) => {
      ctx.beginPath(); ctx.arc((k - 1) * w / 3.2, h * 0.72, w * 0.06, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    });
    ctx.restore();
  } else if (acc === 'cap') {
    const w = unit * 0.55, top = b.y - w * 0.12;
    ctx.save();
    ctx.translate(cx, top); ctx.rotate(-0.1);
    ctx.fillStyle = '#2E2A4F';
    ctx.fillRect(-w * 0.26, 0, w * 0.52, w * 0.2);
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0); ctx.lineTo(0, -w * 0.2); ctx.lineTo(w / 2, 0); ctx.lineTo(0, w * 0.2); ctx.closePath();
    ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.strokeStyle = '#FFC83D'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.38, w * 0.05); ctx.lineTo(w * 0.38, w * 0.32); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.38, w * 0.34, w * 0.04, 0, Math.PI * 2); ctx.fillStyle = '#FFC83D'; ctx.fill();
    ctx.restore();
  } else if (acc === 'stars') {
    const pts = [[-0.62, 0.1, 34], [0.6, 0.02, 40], [-0.5, 0.55, 24], [0.66, 0.5, 26], [0.1, -0.2, 22]];
    pts.forEach(([dx, dy, r], k) => star(ctx, cx + dx * b.w * 0.9, b.y + dy * b.h, r, k % 2 ? '#FFC83D' : '#FF9EC7', k * 0.3));
  } else if (acc === 'medal') {
    // A badge pinned at the lower corner, so it never covers the face.
    const r = unit * 0.13, mx = b.x + b.w * 0.86, my = b.y + b.h * 0.78;
    ctx.save();
    ctx.fillStyle = '#4DB6FF';
    ctx.beginPath(); ctx.moveTo(mx - r * 0.9, my); ctx.lineTo(mx - r * 0.7, my + r * 1.9); ctx.lineTo(mx - r * 0.1, my + r * 1.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF7A6B';
    ctx.beginPath(); ctx.moveTo(mx + r * 0.9, my); ctx.lineTo(mx + r * 0.7, my + r * 1.9); ctx.lineTo(mx + r * 0.1, my + r * 1.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFC83D'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.restore();
    star(ctx, mx, my, r * 0.62, '#FF9E2C');
  } else if (acc === 'heart') {
    [[-0.6, 0.15, 30], [0.62, 0.05, 36], [0.55, 0.55, 24], [-0.55, 0.6, 22]].forEach(([dx, dy, r], k) =>
      heart(ctx, cx + dx * b.w * 0.9, b.y + dy * b.h, r, k % 2 ? '#FF7A6B' : '#FF9EC7'));
  }
}

// ---------- The child holding an exam paper ----------

// Guess the child's skin tone from the face area so the cartoon hands match.
function skinTone(img) {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 12;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, img.width * 0.44, img.height * 0.42, img.width * 0.12, img.height * 0.1, 0, 0, 12, 12);
    const d = x.getImageData(0, 0, 12, 12).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    if (!n) throw 0;
    return [r / n, g / n, b / n].map(Math.round);
  } catch { return [240, 196, 160]; }
}
const rgb = (c, k = 1) => `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')})`;

function hexPath(ctx, cx, cy, w) {
  const h = w * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx - w * 0.3, cy - h / 2); ctx.lineTo(cx + w * 0.3, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy); ctx.lineTo(cx + w * 0.3, cy + h / 2); ctx.lineTo(cx - w * 0.3, cy + h / 2);
  ctx.closePath();
}

export function drawPaper(ctx, cx, cy, pw, ph, rot, name) {
  const F = '"Baloo Bhaijaan 2", "Tajawal", sans-serif';
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  const x = -pw / 2, y = -ph / 2;
  ctx.fillStyle = 'rgba(46,42,79,.25)';
  roundRect(ctx, x + 8, y + 10, pw, ph, 12); ctx.fill();
  ctx.fillStyle = '#fff';
  roundRect(ctx, x, y, pw, ph, 12); ctx.fill();
  // ruled lines + margin, like a school sheet
  ctx.strokeStyle = '#D6E9FA'; ctx.lineWidth = Math.max(1.5, pw * 0.006);
  for (let ly = y + ph * 0.3; ly < y + ph - 6; ly += ph * 0.11) { ctx.beginPath(); ctx.moveTo(x + 8, ly); ctx.lineTo(x + pw - 8, ly); ctx.stroke(); }
  ctx.strokeStyle = '#FFB3AB'; ctx.lineWidth = Math.max(2, pw * 0.008);
  ctx.beginPath(); ctx.moveTo(x + pw * 0.88, y + 4); ctx.lineTo(x + pw * 0.88, y + ph - 4); ctx.stroke();

  ctx.direction = 'rtl'; ctx.textBaseline = 'middle';
  // name
  ctx.fillStyle = '#2E2A4F'; ctx.textAlign = 'right';
  let fs = ph * 0.13;
  ctx.font = `700 ${fs}px ${F}`;
  const label = `الاسم: ${name}`;
  while (ctx.measureText(label).width > pw * 0.7 && fs > 10) { fs -= 1; ctx.font = `700 ${fs}px ${F}`; }
  ctx.fillText(label, x + pw * 0.84, y + ph * 0.14);
  // three letter hexagons like their worksheet
  const hw = pw * 0.17;
  ['يـ', 'ـيـ', 'ـي'].forEach((l, i) => {
    const hx = x + pw * (0.7 - i * 0.21), hy = y + ph * 0.38;
    hexPath(ctx, hx, hy, hw);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#2E2A4F'; ctx.lineWidth = Math.max(1.5, pw * 0.007); ctx.stroke();
    ctx.fillStyle = '#5B5B7A'; ctx.textAlign = 'center';
    ctx.font = `700 ${hw * 0.42}px ${F}`;
    ctx.fillText(l, hx, hy + hw * 0.02);
  });
  // big red "ممتاز"
  ctx.save();
  ctx.translate(x + pw * 0.5, y + ph * 0.7); ctx.rotate(-0.12);
  ctx.fillStyle = '#E0464B'; ctx.textAlign = 'center';
  ctx.font = `700 ${ph * 0.27}px ${F}`;
  ctx.fillText('ممتاز', 0, 0);
  ctx.strokeStyle = '#E0464B'; ctx.lineWidth = Math.max(2, ph * 0.02); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-pw * 0.26, ph * 0.15);
  ctx.quadraticCurveTo(0, ph * 0.22, pw * 0.26, ph * 0.12); ctx.stroke();
  ctx.restore();
  // a red teacher star in the corner (no grade)
  star(ctx, x + pw * 0.14, y + ph * 0.17, ph * 0.11, '#E0464B', -0.2);
  // glitter star stickers
  star(ctx, x + pw * 0.86, y + ph * 0.86, ph * 0.09, '#8E5BE8', 0.2);
  star(ctx, x + pw * 0.12, y + ph * 0.8, ph * 0.07, '#FFC83D', -0.3);
  ctx.restore();
}

// The real class worksheet (name, grade and stamp already removed from the photo).
let realPaperPromise;
function realPaperImage() {
  return (realPaperPromise ||= loadURL('scenes/exam-paper.jpg').catch(() => { realPaperPromise = null; return null; }));
}

function drawRealPaper(ctx, cx, cy, pw, ph, rot, name, img) {
  const F = '"Baloo Bhaijaan 2", "Tajawal", sans-serif';
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  const x = -pw / 2, y = -ph / 2;
  ctx.fillStyle = 'rgba(46,42,79,.28)';
  roundRect(ctx, x + 8, y + 12, pw, ph, 8); ctx.fill();
  ctx.save();
  roundRect(ctx, x, y, pw, ph, 8); ctx.clip();
  ctx.drawImage(img, x, y, pw, ph);
  ctx.restore();
  // the child's name, in blue pen, on the name line
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2346A8';
  let fs = ph * 0.055;
  ctx.font = `700 ${fs}px ${F}`;
  while (ctx.measureText(name).width > pw * 0.22 && fs > 8) { fs -= 1; ctx.font = `700 ${fs}px ${F}`; }
  ctx.fillText(name, x + pw * 0.1, y + ph * 0.13);
  // red "ممتاز" where the grade used to be
  ctx.save();
  ctx.translate(x + pw * 0.13, y + ph * 0.27); ctx.rotate(-0.35);
  ctx.fillStyle = '#E0464B';
  ctx.font = `700 ${ph * 0.075}px ${F}`;
  ctx.fillText('ممتاز', 0, 0);
  ctx.restore();
  star(ctx, x + pw * 0.12, y + ph * 0.345, ph * 0.035, '#FFC83D', 0.2);
  ctx.restore();
}

function hand(ctx, x, y, r, skin, flip) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(flip ? -1 : 1, 1);
  ctx.fillStyle = rgb(skin); ctx.strokeStyle = rgb(skin, 0.72); ctx.lineWidth = Math.max(2, r * 0.12);
  // fingers behind the paper edge
  ctx.beginPath(); ctx.ellipse(r * 0.2, 0, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // thumb on the front of the paper
  ctx.beginPath(); ctx.ellipse(r * 0.95, -r * 0.25, r * 0.55, r * 0.34, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function paperGeom(style, b) {
  const unit = Math.min(b.w, b.h);
  let pw, ph, cx, cy, rot;
  if (style === 'real') {         // the class's real exam sheet (portrait), held below the chin
    pw = unit * 0.6; ph = pw * 1.508; cx = b.x + b.w / 2; cy = b.y + b.h * 0.66 + ph / 2; rot = -0.05;
  } else if (style === 'big') {   // big sheet in front of the body, face fully visible
    pw = unit * 0.92; ph = pw * 0.62; cx = b.x + b.w / 2; cy = b.y + b.h * 1.0; rot = -0.04;
  } else if (style === 'side') {  // showing the paper next to the face
    pw = unit * 0.5; ph = pw * 0.78; cx = b.x + b.w * 0.95; cy = b.y + b.h * 0.6; rot = 0.14;
  } else {                        // held at the chest, below the chin
    pw = unit * 0.66; ph = pw * 0.72; cx = b.x + b.w / 2; cy = b.y + b.h * 0.98; rot = -0.07;
  }
  return { pw, ph, cx, cy, rot, bottom: Math.max(b.h, cy - b.y + ph / 2 + Math.abs(Math.sin(rot)) * pw / 2) };
}

function drawHeldPaper(ctx, b, img, name, style, realImg) {
  const skin = skinTone(img);
  const { pw, ph, cx, cy, rot } = paperGeom(style, b);
  if (style === 'real' && realImg) {
    drawRealPaper(ctx, cx, cy, pw, ph, rot, name, realImg);
    const r = pw * 0.085, hy = cy - ph * 0.1;
    hand(ctx, cx - (pw / 2) * Math.cos(rot) - 2, hy - (pw / 2) * Math.sin(rot), r, skin, false);
    hand(ctx, cx + (pw / 2) * Math.cos(rot) + 2, hy + (pw / 2) * Math.sin(rot), r, skin, true);
    return;
  }
  // hands first (fingers behind), then the paper, then thumbs again on top
  const r = pw * 0.085;
  const hy = cy + ph * 0.05;
  const lx = cx - (pw / 2) * Math.cos(rot) - 2, rx = cx + (pw / 2) * Math.cos(rot) + 2;
  const lyy = hy - (pw / 2) * Math.sin(rot), ryy = hy + (pw / 2) * Math.sin(rot);
  drawPaper(ctx, cx, cy, pw, ph, rot, name);
  hand(ctx, lx, lyy, r, skin, false);
  hand(ctx, rx, ryy, r, skin, true);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBanner(ctx, text) {
  const x = 40, y = BANNER_TOP + 10, w = S - 80, h = S - y - 34;
  ctx.save();
  ctx.fillStyle = 'rgba(46,42,79,.22)';
  roundRect(ctx, x, y + 8, w, h, 40); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x, y, w, h, 40); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#FFC83D'; ctx.stroke();

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2E2A4F';
  let size = 54, lines;
  do {
    ctx.font = `700 ${size}px "Baloo Bhaijaan 2", "Tajawal", sans-serif`;
    lines = wrapLines(ctx, text, w - 70);
    size -= 2;
  } while ((lines.length > 2 || lines.length * size * 1.25 > h - 20) && size > 26);
  const lh = (size + 2) * 1.22;
  const startY = y + h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, S / 2, startY + i * lh));
  ctx.restore();
}

function drawTag(ctx, tag) {
  ctx.save();
  ctx.direction = 'rtl';
  ctx.font = '700 30px "Baloo Bhaijaan 2", "Tajawal", sans-serif';
  const w = ctx.measureText(tag).width + 48;
  const x = S - 30 - w, y = 28;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  roundRect(ctx, x, y, w, 56, 28); ctx.fill();
  ctx.fillStyle = '#3B2F9E';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(tag, x + w / 2, y + 30);
  ctx.restore();
}

export const canvasBlob = c => new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
