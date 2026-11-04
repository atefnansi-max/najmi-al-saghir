// Voice input in Jordanian Arabic using the browser's built-in speech recognition (free).
// Works in Chrome, Edge and Safari. Other browsers fall back to typing.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const voiceSupported = !!SR;

export function listen({ onText, onEnd, onError }) {
  if (!SR) { onError?.('unsupported'); return null; }
  const rec = new SR();
  rec.lang = 'ar-JO';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = '';
  rec.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t + ' ';
      else interim += t;
    }
    onText?.((finalText + interim).trim(), false);
  };
  rec.onerror = e => onError?.(e.error);
  rec.onend = () => onEnd?.(finalText.trim());
  try { rec.start(); } catch { onError?.('start'); return null; }
  return rec;
}
