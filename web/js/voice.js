// Voice input in Arabic using the browser's built-in speech recognition (free).
// Works in Chrome (Android, computer), Edge and Safari. If Jordanian Arabic isn't
// available on the device we fall back to other Arabic variants.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const voiceSupported = !!SR;
const LANGS = ['ar-JO', 'ar-SA', 'ar-EG', 'ar'];
let langIndex = 0;

export function inFrame() {
  try { return window.self !== window.top; } catch { return true; }
}

// Friendly Arabic message for each failure the browser can report.
export function voiceError(code) {
  if (inFrame()) return 'المايك ما بيشتغل جوّا صفحة Claude. افتحي رابط الموقع مباشرة، أو استعملي 🎤 تبع الكيبورد';
  switch (code) {
    case 'not-allowed': return 'لازم تسمحي للمايك: من إعدادات المتصفح ← الموقع ← المايكروفون ← سماح 🎤';
    case 'service-not-allowed': return 'المتصفح هون ما بيسمح بالمايك. افتحي الرابط بـ Chrome أو Safari، أو استعملي 🎤 تبع الكيبورد';
    case 'network': return 'المايك بدّو إنترنت. تأكدي من النت وجرّبي كمان مرة';
    case 'no-speech': return 'ما سمعت إشي، احكي أقرب شوي وجرّبي كمان مرة 🎤';
    case 'audio-capture': return 'ما لقينا مايك على الجهاز';
    case 'unsupported': return 'المايك مش شغّال بهالمتصفح. استعملي 🎤 تبع الكيبورد واكتبي بصوتك';
    default: return 'ما زبط المايك، جرّبي كمان مرة، أو استعملي 🎤 تبع الكيبورد';
  }
}

export function listen({ onText, onEnd, onError }) {
  if (!SR) { onError?.('unsupported'); return null; }
  let rec;
  let finalText = '';
  let stopped = false;
  const start = () => {
    rec = new SR();
    rec.lang = LANGS[langIndex];
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interim += t;
      }
      onText?.((finalText + interim).trim(), false);
    };
    let retrying = false;
    rec.onerror = e => {
      // This device doesn't know Jordanian Arabic: try the next Arabic variant.
      if ((e.error === 'language-not-supported' || e.error === 'bad-grammar') && langIndex < LANGS.length - 1) {
        langIndex++; retrying = true;
        return;
      }
      stopped = true;
      onError?.(e.error);
    };
    rec.onend = () => {
      if (retrying) { retrying = false; try { start(); } catch { onError?.('start'); } return; }
      if (!stopped) onEnd?.(finalText.trim());
    };
    rec.start();
  };
  try { start(); } catch { onError?.('start'); return null; }
  return { stop: () => { try { rec.stop(); } catch { /* ignore */ } } };
}
