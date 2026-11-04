// Sending the star: phone share sheet when available, otherwise download + open WhatsApp/Facebook.

export function canShareFiles(file) {
  try { return !!(navigator.canShare && navigator.canShare({ files: [file] })); }
  catch { return false; }
}

export async function shareImage(file, text) {
  try {
    await navigator.share({ files: [file], text });
    return true;
  } catch (e) {
    return false; // the teacher closed the share sheet
  }
}

// Jordanian numbers: 0791234567 -> 962791234567
export function waNumber(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '962' + d.slice(1);
  else if (d.length === 9 && d.startsWith('7')) d = '962' + d;
  return d;
}

export function openWhatsApp(phone, text) {
  const n = waNumber(phone);
  const url = `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

export function openFacebook() {
  window.open('https://www.facebook.com/', '_blank', 'noopener');
}

export function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
