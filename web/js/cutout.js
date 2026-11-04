// Turns a child's photo into a sticker. The background is removed inside the browser,
// so the photo never leaves the teacher's device. If smart cut-out fails, we fall back
// to a round sticker so the teacher is never stuck.

const BG_LIB = 'https://esm.sh/@imgly/background-removal@1.4.5';

export function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

const canvasToBlob = (c, type = 'image/png', q) => new Promise(r => c.toBlob(r, type, q));

// Shrink big phone photos so storage and processing stay fast.
export async function shrink(file, max = 1024) {
  const img = await blobToImage(file);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return canvasToBlob(c, 'image/jpeg', 0.9);
}

let libPromise;
export async function smartCutout(photoBlob, onProgress = () => {}) {
  if (!libPromise) libPromise = import(BG_LIB);
  const lib = await libPromise;
  const removeBackground = lib.removeBackground || lib.default;
  const cut = await removeBackground(photoBlob, {
    progress: (key, current, total) => {
      if (total) onProgress(Math.min(0.95, current / total));
    },
    output: { format: 'image/png' },
  });
  onProgress(1);
  return outlineSticker(await blobToImage(cut));
}

// Trim empty edges and add a thick white outline like a real sticker.
export async function outlineSticker(img, stroke = 16) {
  const src = document.createElement('canvas');
  src.width = img.width; src.height = img.height;
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const box = alphaBox(sctx, src.width, src.height);
  if (!box) throw new Error('empty');

  const pad = stroke + 4;
  const out = document.createElement('canvas');
  out.width = box.w + pad * 2; out.height = box.h + pad * 2;
  const ctx = out.getContext('2d');

  const sil = document.createElement('canvas');
  sil.width = out.width; sil.height = out.height;
  const sil2 = sil.getContext('2d');
  sil2.drawImage(src, box.x, box.y, box.w, box.h, pad, pad, box.w, box.h);
  sil2.globalCompositeOperation = 'source-in';
  sil2.fillStyle = '#fff';
  sil2.fillRect(0, 0, sil.width, sil.height);

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.drawImage(sil, Math.cos(a) * stroke, Math.sin(a) * stroke);
  }
  ctx.drawImage(src, box.x, box.y, box.w, box.h, pad, pad, box.w, box.h);
  return canvasToBlob(out);
}

function alphaBox(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Round sticker: always works, no download needed.
export async function circleSticker(photoBlob, size = 640) {
  const img = await blobToImage(photoBlob);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(r, r, r - 18, 0, Math.PI * 2); ctx.clip();
  const s = Math.max((size - 36) / img.width, (size - 36) / img.height);
  const w = img.width * s, h = img.height * s;
  // Faces usually sit in the upper part of a portrait, so bias the crop upward.
  ctx.drawImage(img, r - w / 2, r - h / 2 + Math.max(0, (h - size) * 0.18), w, h);
  ctx.restore();
  return canvasToBlob(c);
}
