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

  const imgs = await Promise.all((o.stickers || []).map(blobToImage));
  const n = imgs.length;
  const maxH = n > 2 ? 420 : n === 2 ? 520 : 600;
  const maxW = n > 2 ? 320 : n === 2 ? 420 : 560;
  const gap = 20;
  const sizes = imgs.map(im => {
    const k = Math.min(maxH / im.height, maxW / im.width);
    return { w: im.width * k, h: im.height * k };
  });
  const total = sizes.reduce((a, b) => a + b.w, 0) + gap * (n - 1);
  let x = (S - total) / 2;
  const boxes = [];
  imgs.forEach((im, i) => {
    const { w, h } = sizes[i];
    const y = BANNER_TOP + 30 - h;
    ctx.fillStyle = 'rgba(46,42,79,.18)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, BANNER_TOP + 26, w * 0.42, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(im, x, y, w, h);
    boxes.push({ x, y, w, h });
    x += w + gap;
  });

  boxes.forEach((b, i) => drawAccessory(ctx, o.acc, b, i));
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
