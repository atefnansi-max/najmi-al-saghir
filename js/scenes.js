// Ready-made scenes, drawn as flat SVG in one shared style (no cost, works offline).
// Every scene is 1080x1080 and leaves the centre free for the child.

const W = 1080;

function rand(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function stars(n, color, seed, yMax = 600, size = 6) {
  const r = rand(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * yMax, s = size * (0.5 + r());
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="${color}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  }
  return out;
}

function star5(cx, cy, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${fill}" stroke-linejoin="round"/>`;
}

function cloud(x, y, s, fill = '#fff') {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">
    <circle cx="0" cy="0" r="40"/><circle cx="45" cy="-18" r="52"/><circle cx="100" cy="0" r="40"/>
    <rect x="0" y="0" width="100" height="40"/></g>`;
}

function bunting(y, colors) {
  let out = `<path d="M0 ${y} Q540 ${y + 60} 1080 ${y}" stroke="#fff" stroke-width="5" fill="none"/>`;
  for (let i = 0; i < 12; i++) {
    const x = 45 + i * 90;
    const t = x / W;
    const yy = y + 4 * 60 * t * (1 - t) * 0.5 * 2 / 2 + 0;
    const c = colors[i % colors.length];
    out += `<path d="M${x - 30} ${yy} L${x + 30} ${yy} L${x} ${yy + 60}Z" fill="${c}"/>`;
  }
  return out;
}

function balloon(x, y, c) {
  return `<g><path d="M${x} ${y + 70} q-10 60 10 130" stroke="#fff" stroke-width="3" fill="none"/>
    <ellipse cx="${x}" cy="${y}" rx="52" ry="64" fill="${c}"/>
    <path d="M${x - 8} ${y + 62} l8 12 l8 -12z" fill="${c}"/>
    <ellipse cx="${x - 18}" cy="${y - 22}" rx="10" ry="18" fill="#fff" opacity=".45"/></g>`;
}

function lantern(x, y, c) {
  return `<g><line x1="${x}" y1="0" x2="${x}" y2="${y}" stroke="#F2D58A" stroke-width="3"/>
    <path d="M${x - 22} ${y} h44 l-8 -16 h-28z" fill="#F2B640"/>
    <path d="M${x - 34} ${y} h68 l-10 90 h-48z" fill="${c}"/>
    <rect x="${x - 18}" y="${y + 18}" width="36" height="52" rx="10" fill="#FFE8A3" opacity=".9"/>
    <path d="M${x - 24} ${y + 90} h48 l-8 18 h-32z" fill="#F2B640"/></g>`;
}

const SCENES = [
  {
    id: 'space', name: 'الفضاء', emoji: '🚀', acc: 'stars',
    words: ['فضاء', 'الفضاء', 'صاروخ', 'رائد', 'كواكب', 'كوكب', 'قمر', 'نجوم'],
    svg: () => `
      <rect width="1080" height="1080" fill="#2B2466"/>
      <circle cx="900" cy="140" r="260" fill="#3B3290" opacity=".6"/>
      ${stars(90, '#fff', 7, 760, 4)}
      ${star5(160, 150, 26, '#FFC83D')}${star5(980, 520, 18, '#FFC83D')}${star5(90, 560, 14, '#FF9EC7')}
      <circle cx="860" cy="230" r="110" fill="#FF9EC7"/><circle cx="830" cy="200" r="24" fill="#FF7FB4"/><circle cx="900" cy="270" r="16" fill="#FF7FB4"/>
      <ellipse cx="860" cy="235" rx="190" ry="34" fill="none" stroke="#FFC83D" stroke-width="14" transform="rotate(-14 860 235)"/>
      <circle cx="200" cy="330" r="60" fill="#4DB6FF"/><path d="M160 310 q30 -20 70 6 q-20 30 -60 20z" fill="#2EC4A0"/>
      <g transform="translate(110 610) rotate(-25)">
        <path d="M0 -120 q40 50 40 140 h-80 q0 -90 40 -140z" fill="#fff"/>
        <circle cx="0" cy="-30" r="20" fill="#4DB6FF" stroke="#C9C4FF" stroke-width="6"/>
        <path d="M-40 10 l-30 40 h30z M40 10 l30 40 h-30z" fill="#FF7A6B"/>
        <path d="M-22 22 q22 70 44 0z" fill="#FFC83D"/>
      </g>
      <path d="M0 880 Q270 820 540 860 T1080 850 V1080 H0z" fill="#A9A3E8"/>
      <ellipse cx="220" cy="940" rx="70" ry="22" fill="#8C85D6"/><ellipse cx="880" cy="960" rx="90" ry="26" fill="#8C85D6"/><ellipse cx="600" cy="1010" rx="50" ry="16" fill="#8C85D6"/>`,
  },
  {
    id: 'sea', name: 'أعماق البحر', emoji: '🐠', acc: 'none',
    words: ['بحر', 'البحر', 'غواص', 'سمك', 'سمكة', 'تحت الماي', 'مرجان', 'غوص'],
    svg: () => `
      <rect width="1080" height="1080" fill="#4DB6FF"/>
      <rect y="380" width="1080" height="700" fill="#3A9EE8"/>
      <rect y="700" width="1080" height="380" fill="#2F87D0"/>
      <path d="M0 120 Q270 80 540 120 T1080 120" stroke="#A8DCFF" stroke-width="10" fill="none" opacity=".7"/>
      ${[[120, 300, 22], [980, 420, 16], [930, 360, 10], [160, 520, 12], [70, 420, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>`).join('')}
      <g transform="translate(820 200)"><ellipse rx="70" ry="44" fill="#FFC83D"/><path d="M60 0 l60 -40 v80z" fill="#FFC83D"/><circle cx="-34" cy="-8" r="9" fill="#2E2A4F"/><path d="M-20 -40 q20 40 0 80" stroke="#FF9E2C" stroke-width="10" fill="none"/></g>
      <g transform="translate(220 160) scale(-0.75 0.75)"><ellipse rx="70" ry="44" fill="#FF7A6B"/><path d="M60 0 l60 -40 v80z" fill="#FF7A6B"/><circle cx="-34" cy="-8" r="9" fill="#2E2A4F"/></g>
      <g transform="translate(940 640) scale(.6)"><ellipse rx="70" ry="44" fill="#FF9EC7"/><path d="M60 0 l60 -40 v80z" fill="#FF9EC7"/><circle cx="-34" cy="-8" r="9" fill="#2E2A4F"/></g>
      <path d="M0 900 Q300 860 540 900 T1080 890 V1080 H0z" fill="#F7D99B"/>
      <path d="M80 900 q-20 -120 20 -220 q30 100 -10 220z M130 900 q20 -90 0 -170 q40 60 30 170z" fill="#2EC4A0"/>
      <path d="M960 900 q-30 -140 10 -260 q40 120 0 260z M1010 900 q20 -80 -5 -150 q40 60 30 150z" fill="#1FA987"/>
      <g fill="#FF7A6B"><path d="M860 905 v-90 m0 40 l-40 -50 m40 70 l40 -60" stroke="#FF7A6B" stroke-width="18" stroke-linecap="round" fill="none"/></g>
      <g fill="#FF9EC7"><path d="M230 905 v-70 m0 30 l-30 -40 m30 50 l34 -46" stroke="#FF9EC7" stroke-width="16" stroke-linecap="round" fill="none"/></g>
      ${star5(700, 960, 30, '#FF9E2C')}${star5(340, 980, 22, '#FFC83D')}`,
  },
  {
    id: 'safari', name: 'السفاري', emoji: '🦁', acc: 'medal',
    words: ['سفاري', 'غابة', 'الغابة', 'أسد', 'اسد', 'زرافة', 'حيوانات', 'مستكشف'],
    svg: () => `
      <rect width="1080" height="1080" fill="#FFE7A8"/>
      <circle cx="540" cy="300" r="170" fill="#FFC83D"/>
      ${cloud(110, 160, 1)}${cloud(820, 110, .8)}
      <path d="M0 640 Q300 560 600 620 T1080 600 V1080 H0z" fill="#B6D96C"/>
      <path d="M0 780 Q300 720 620 780 T1080 760 V1080 H0z" fill="#8FC24A"/>
      <g transform="translate(140 640)"><rect x="-12" y="-150" width="24" height="170" fill="#8A5A2B"/>
        <ellipse cx="0" cy="-170" rx="150" ry="46" fill="#5FA83A"/><ellipse cx="-60" cy="-200" rx="80" ry="30" fill="#6FBA45"/></g>
      <g transform="translate(900 700)">
        <rect x="-60" y="-60" width="120" height="70" rx="30" fill="#FFC24D"/>
        <rect x="-50" y="0" width="16" height="90" fill="#FFC24D"/><rect x="34" y="0" width="16" height="90" fill="#FFC24D"/>
        <rect x="30" y="-260" width="34" height="220" rx="14" fill="#FFC24D" transform="rotate(12 47 -150)"/>
        <ellipse cx="80" cy="-270" rx="40" ry="28" fill="#FFC24D"/>
        <circle cx="90" cy="-276" r="6" fill="#2E2A4F"/>
        <circle cx="-20" cy="-30" r="10" fill="#D9892B"/><circle cx="20" cy="-40" r="12" fill="#D9892B"/><circle cx="58" cy="-150" r="9" fill="#D9892B"/>
      </g>
      <path d="M40 1080 l20 -90 l20 90z M90 1080 l14 -60 l14 60z M980 1080 l18 -80 l18 80z" fill="#5FA83A"/>`,
  },
  {
    id: 'castle', name: 'القلعة', emoji: '🏰', acc: 'crown',
    words: ['قلعة', 'القلعة', 'أمير', 'امير', 'أميرة', 'اميرة', 'فارس', 'فارسة', 'ملك', 'ملكة', 'قصر'],
    svg: () => `
      <rect width="1080" height="1080" fill="#FFD9E8"/>
      <g fill="none" stroke-width="34" opacity=".85">
        <path d="M60 760 A480 480 0 0 1 1020 760" stroke="#FF7A6B"/>
        <path d="M94 760 A446 446 0 0 1 986 760" stroke="#FFC83D"/>
        <path d="M128 760 A412 412 0 0 1 952 760" stroke="#2EC4A0"/>
        <path d="M162 760 A378 378 0 0 1 918 760" stroke="#4DB6FF"/>
      </g>
      ${cloud(80, 230, .9)}${cloud(860, 300, .8)}
      <g fill="#C9C4FF">
        <rect x="40" y="380" width="170" height="440"/><rect x="870" y="380" width="170" height="440"/>
        <rect x="200" y="560" width="680" height="260"/>
      </g>
      <g fill="#A9A3E8">
        ${[40, 85, 130, 175].map(x => `<rect x="${x}" y="350" width="30" height="40"/>`).join('')}
        ${[870, 915, 960, 1005].map(x => `<rect x="${x}" y="350" width="30" height="40"/>`).join('')}
      </g>
      <path d="M30 380 L125 230 L220 380z M860 380 L955 230 L1050 380z" fill="#6C5CE7"/>
      <path d="M125 230 v-70 l60 22 l-60 22" fill="#FF7A6B" stroke="#6C5CE7" stroke-width="5"/>
      <path d="M955 230 v-70 l60 22 l-60 22" fill="#FFC83D" stroke="#6C5CE7" stroke-width="5"/>
      <rect x="95" y="470" width="60" height="90" rx="30" fill="#6C5CE7"/><rect x="925" y="470" width="60" height="90" rx="30" fill="#6C5CE7"/>
      <path d="M0 820 Q540 760 1080 820 V1080 H0z" fill="#8FD98E"/>
      <path d="M0 920 Q540 870 1080 920 V1080 H0z" fill="#6CC26B"/>
      ${star5(330, 180, 20, '#FFC83D')}${star5(760, 150, 16, '#fff')}`,
  },
  {
    id: 'dino', name: 'الديناصورات', emoji: '🦕', acc: 'none',
    words: ['ديناصور', 'ديناصورات', 'بركان', 'ديناصورات'],
    svg: () => `
      <rect width="1080" height="1080" fill="#D6F5EC"/>
      <path d="M700 560 L860 250 h60 L1080 560z" fill="#B07A57"/>
      <path d="M860 250 h60 l-12 40 q-18 -14 -36 0z" fill="#FF7A6B"/>
      <circle cx="880" cy="190" r="40" fill="#E6DDD3"/><circle cx="930" cy="140" r="30" fill="#EFE8E0"/><circle cx="890" cy="100" r="22" fill="#F5F0EB"/>
      <path d="M0 620 Q300 560 600 600 T1080 580 V1080 H0z" fill="#8FD98E"/>
      <g transform="translate(150 700)">
        <ellipse cx="0" cy="0" rx="130" ry="80" fill="#2EC4A0"/>
        <path d="M80 -30 q90 -60 80 -230 q0 -30 30 -30 q40 0 40 34 q0 26 -30 30 q-10 120 -60 230z" fill="#2EC4A0"/>
        <circle cx="200" cy="-240" r="7" fill="#2E2A4F"/>
        <path d="M-120 10 q-120 10 -170 -40 q80 70 170 70z" fill="#2EC4A0"/>
        <rect x="-80" y="50" width="40" height="80" rx="18" fill="#22A586"/><rect x="40" y="50" width="40" height="80" rx="18" fill="#22A586"/>
        ${[-60, -20, 20, 60].map(x => `<circle cx="${x}" cy="-60" r="16" fill="#FFC83D"/>`).join('')}
      </g>
      <path d="M0 860 Q540 800 1080 860 V1080 H0z" fill="#6CC26B"/>
      <g fill="#3E9E5A"><path d="M960 860 q-60 -120 -10 -230 q20 120 40 230z"/><path d="M1000 860 q40 -100 20 -200 q40 90 10 200z"/></g>
      <ellipse cx="880" cy="1000" rx="40" ry="50" fill="#FFF8EC"/><path d="M850 990 l15 -10 l15 10 l15 -10 l15 10" stroke="#D9CDB5" stroke-width="4" fill="none"/>
      ${cloud(90, 180, .9)}${cloud(420, 120, .7)}`,
  },
  {
    id: 'circus', name: 'السيرك', emoji: '🎪', acc: 'stars',
    words: ['سيرك', 'السيرك', 'مهرج', 'عرض', 'مسرح'],
    svg: () => `
      <rect width="1080" height="1080" fill="#FFF0C9"/>
      <path d="M540 60 L1080 480 H0z" fill="#FF7A6B"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M540 60 L${i * 216 - 54} 480 H${i * 216 + 54}z" fill="#fff"/>`).join('')}
      <path d="M540 60 v-50 l70 25 l-70 25" fill="#FFC83D" stroke="#FF7A6B" stroke-width="6"/>
      <path d="M0 480 h1080 v30 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0 q-54 40 -108 0z" fill="#FFC83D"/>
      <rect y="510" width="1080" height="570" fill="#9A2E22" opacity=".18"/>
      <path d="M0 510 q100 260 0 570z" fill="#6C5CE7"/><path d="M1080 510 q-100 260 0 570z" fill="#6C5CE7"/>
      <path d="M340 520 L130 1080 H560z" fill="#FFF8D6" opacity=".55"/><path d="M740 520 L520 1080 H950z" fill="#FFF8D6" opacity=".55"/>
      <ellipse cx="540" cy="960" rx="440" ry="90" fill="#FF7A6B"/><ellipse cx="540" cy="940" rx="400" ry="70" fill="#FFC83D"/>
      ${star5(200, 620, 22, '#FFC83D')}${star5(880, 650, 26, '#FFC83D')}${star5(120, 800, 14, '#fff')}`,
  },
  {
    id: 'doctor', name: 'العيادة', emoji: '🩺', acc: 'heart',
    words: ['طبيب', 'طبيبة', 'دكتور', 'دكتورة', 'عيادة', 'مستشفى', 'ممرض', 'ممرضة'],
    svg: () => `
      <rect width="1080" height="1080" fill="#DCEFFF"/>
      <rect y="760" width="1080" height="320" fill="#BFE0F7"/>
      <g transform="translate(150 250)"><rect x="-90" y="-90" width="180" height="180" rx="40" fill="#fff"/>
        <rect x="-24" y="-64" width="48" height="128" rx="12" fill="#FF7A6B"/><rect x="-64" y="-24" width="128" height="48" rx="12" fill="#FF7A6B"/></g>
      <path d="M930 200 c-40 -60 -130 -20 -100 50 c20 40 100 90 100 90 s80 -50 100 -90 c30 -70 -60 -110 -100 -50z" fill="#FF9EC7"/>
      <g transform="translate(940 560) rotate(30)"><rect x="-80" y="-26" width="160" height="52" rx="26" fill="#FFE3C8"/><rect x="-26" y="-26" width="52" height="52" fill="#F7CBA3"/>
        ${[-10, 10].map(x => [-10, 10].map(y => `<circle cx="${x}" cy="${y}" r="4" fill="#E0A97C"/>`).join('')).join('')}</g>
      <g transform="translate(130 640)"><rect x="-60" y="-110" width="120" height="150" rx="16" fill="#fff"/><rect x="-40" y="-130" width="80" height="34" rx="10" fill="#4DB6FF"/>
        <rect x="-40" y="-70" width="80" height="10" rx="5" fill="#BFE0F7"/><rect x="-40" y="-44" width="60" height="10" rx="5" fill="#BFE0F7"/><rect x="-40" y="-18" width="70" height="10" rx="5" fill="#BFE0F7"/></g>
      <path d="M0 760 h1080" stroke="#9FCDEE" stroke-width="8"/>
      ${[[300, 130], [760, 90], [600, 180]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-14" y="-40" width="28" height="80" rx="8" fill="#fff" opacity=".8"/><rect x="-40" y="-14" width="80" height="28" rx="8" fill="#fff" opacity=".8"/></g>`).join('')}`,
  },
  {
    id: 'fire', name: 'الإطفاء', emoji: '🚒', acc: 'medal',
    words: ['إطفاء', 'اطفاء', 'إطفائي', 'اطفائي', 'رجل إطفاء', 'سيارة إطفاء', 'مدينة'],
    svg: () => `
      <rect width="1080" height="1080" fill="#DCEFFF"/>
      ${cloud(100, 150, .8)}${cloud(780, 120, 1)}
      <g fill="#C9C4FF">
        <rect x="0" y="380" width="160" height="440"/><rect x="170" y="300" width="120" height="520"/>
        <rect x="800" y="330" width="130" height="490"/><rect x="940" y="420" width="140" height="400"/>
      </g>
      <g fill="#FFF8EC">${[[30, 420], [90, 420], [30, 500], [90, 500], [30, 580], [90, 580], [200, 340], [250, 340], [200, 420], [250, 420], [200, 500], [250, 500], [830, 380], [880, 380], [830, 460], [880, 460], [830, 540], [880, 540], [970, 470], [1030, 470], [970, 550], [1030, 550]].map(([x, y]) => `<rect x="${x}" y="${y}" width="34" height="44" rx="6"/>`).join('')}</g>
      <rect y="820" width="1080" height="260" fill="#8A8FA8"/>
      ${[60, 300, 540, 780, 1020].map(x => `<rect x="${x - 50}" y="930" width="100" height="16" rx="8" fill="#fff"/>`).join('')}
      <g transform="translate(800 760)">
        <rect x="-10" y="-40" width="300" height="130" rx="20" fill="#FF5E4D"/>
        <rect x="-110" y="-10" width="120" height="100" rx="20" fill="#FF5E4D"/>
        <rect x="-90" y="10" width="70" height="44" rx="10" fill="#DCEFFF"/>
        <path d="M20 -50 L260 -150" stroke="#E6E6EE" stroke-width="18"/><path d="M30 -40 L270 -140" stroke="#E6E6EE" stroke-width="6" stroke-dasharray="4 26"/>
        <rect x="-30" y="-70" width="40" height="28" rx="8" fill="#4DB6FF"/>
        <circle cx="-50" cy="100" r="40" fill="#2E2A4F"/><circle cx="-50" cy="100" r="16" fill="#C9C4FF"/>
        <circle cx="200" cy="100" r="40" fill="#2E2A4F"/><circle cx="200" cy="100" r="16" fill="#C9C4FF"/>
      </g>`,
  },
  {
    id: 'desert', name: 'الصحراء', emoji: '🐪', acc: 'medal',
    words: ['صحراء', 'الصحراء', 'جمل', 'خيمة', 'رمل', 'بادية', 'وادي رم'],
    svg: () => `
      <rect width="1080" height="1080" fill="#FFB86B"/>
      <rect width="1080" height="320" fill="#FF9E6B"/>
      <circle cx="800" cy="300" r="120" fill="#FFE08A"/>
      ${star5(160, 120, 16, '#FFF4D6')}${star5(320, 70, 10, '#FFF4D6')}${star5(980, 90, 12, '#FFF4D6')}
      <path d="M0 640 Q260 520 560 620 T1080 560 V1080 H0z" fill="#F2B166"/>
      <path d="M0 780 Q340 680 700 760 T1080 720 V1080 H0z" fill="#E89A4B"/>
      <g transform="translate(160 720)">
        <path d="M-120 60 L0 -110 L120 60z" fill="#9A2E22"/>
        <path d="M-120 60 L0 -110 L-40 60z" fill="#C24A3A"/>
        <path d="M-30 60 L0 -20 L30 60z" fill="#5A1A12"/>
        ${[-90, -60, -30, 0, 30, 60, 90].map(x => `<rect x="${x - 6}" y="30" width="12" height="30" fill="#FFC83D"/>`).join('')}
      </g>
      <g transform="translate(910 760)" fill="#C98A4B">
        <ellipse cx="0" cy="0" rx="110" ry="54"/><ellipse cx="-20" cy="-50" rx="50" ry="40"/><ellipse cx="40" cy="-46" rx="40" ry="34"/>
        <path d="M-100 -10 q-50 -40 -40 -120 q6 -20 30 -14 q-10 70 30 110z"/>
        <ellipse cx="-125" cy="-140" rx="34" ry="20"/>
        <circle cx="-138" cy="-146" r="5" fill="#2E2A4F"/>
        <rect x="-80" y="30" width="20" height="100" rx="8"/><rect x="-40" y="30" width="20" height="100" rx="8"/>
        <rect x="40" y="30" width="20" height="100" rx="8"/><rect x="80" y="30" width="20" height="100" rx="8"/>
        <path d="M-60 -90 h90 l-10 30 h-70z" fill="#FF7A6B"/>
      </g>`,
  },
  {
    id: 'ramadan', name: 'رمضان', emoji: '🌙', acc: 'stars',
    words: ['رمضان', 'فانوس', 'فوانيس', 'هلال', 'سحور', 'إفطار', 'افطار'],
    svg: () => `
      <rect width="1080" height="1080" fill="#2B2466"/>
      ${stars(70, '#FFE8A3', 21, 700, 4)}
      <circle cx="830" cy="240" r="110" fill="#FFC83D"/><circle cx="880" cy="200" r="100" fill="#2B2466"/>
      ${lantern(140, 130, '#FF7A6B')}${lantern(300, 70, '#2EC4A0')}${lantern(980, 110, '#FF9EC7')}
      <g fill="#3B3290">
        <rect x="0" y="720" width="1080" height="360"/>
        <path d="M60 720 v-140 q60 -90 120 0 v140z"/><rect x="250" y="520" width="34" height="200"/><path d="M250 520 l17 -50 l17 50z"/>
        <path d="M760 720 v-180 q100 -140 200 0 v180z"/><rect x="990" y="480" width="34" height="240"/><path d="M990 480 l17 -50 l17 50z"/>
      </g>
      <g fill="#FFE8A3" opacity=".8">${[[90, 640], [140, 640], [800, 620], [860, 620], [920, 620]].map(([x, y]) => `<rect x="${x}" y="${y}" width="26" height="40" rx="13"/>`).join('')}</g>
      <path d="M0 900 Q540 860 1080 900 V1080 H0z" fill="#4B3DC4"/>`,
  },
  {
    id: 'eid', name: 'العيد', emoji: '🎁', acc: 'stars',
    words: ['عيد', 'العيد', 'هدية', 'هدايا', 'عيدية', 'عيد الفطر', 'عيد الأضحى'],
    svg: () => `
      <rect width="1080" height="1080" fill="#E9E5FF"/>
      ${bunting(60, ['#FFC83D', '#FF7A6B', '#2EC4A0', '#4DB6FF', '#FF9EC7'])}
      <circle cx="170" cy="260" r="80" fill="#FFC83D"/><circle cx="205" cy="235" r="72" fill="#E9E5FF"/>
      ${star5(900, 260, 40, '#FFC83D')}${star5(780, 200, 20, '#FF9EC7')}${star5(330, 180, 18, '#4DB6FF')}
      ${stars(40, '#C9C4FF', 33, 700, 6)}
      <path d="M0 860 Q540 800 1080 860 V1080 H0z" fill="#C9C4FF"/>
      ${[[140, 830, '#FF7A6B', '#FFC83D'], [930, 840, '#2EC4A0', '#FF9EC7'], [820, 900, '#4DB6FF', '#FFC83D']].map(([x, y, c, r]) => `
        <g transform="translate(${x} ${y})"><rect x="-70" y="-60" width="140" height="120" rx="14" fill="${c}"/><rect x="-80" y="-80" width="160" height="34" rx="10" fill="${c}"/>
        <rect x="-12" y="-80" width="24" height="140" fill="${r}"/><path d="M0 -80 q-50 -50 -60 -10 q20 20 60 10 q40 10 60 -10 q-10 -40 -60 10" fill="${r}"/></g>`).join('')}`,
  },
  {
    id: 'birthday', name: 'عيد ميلاد', emoji: '🎂', acc: 'crown',
    words: ['ميلاد', 'عيد ميلاد', 'كيك', 'كيكة', 'شموع', 'بالونات', 'بالون'],
    svg: () => `
      <rect width="1080" height="1080" fill="#FFF0C9"/>
      ${bunting(40, ['#FF7A6B', '#4DB6FF', '#FFC83D', '#2EC4A0', '#FF9EC7'])}
      ${balloon(130, 280, '#FF7A6B')}${balloon(250, 220, '#4DB6FF')}${balloon(860, 230, '#2EC4A0')}${balloon(970, 300, '#FF9EC7')}
      ${stars(50, '#FF9EC7', 5, 1000, 7)}
      <path d="M0 880 Q540 840 1080 880 V1080 H0z" fill="#FFD9E8"/>
      <g transform="translate(900 840)">
        <rect x="-110" y="-60" width="220" height="120" rx="18" fill="#FF9EC7"/>
        <rect x="-110" y="-60" width="220" height="30" rx="14" fill="#fff"/>
        <rect x="-80" y="-150" width="160" height="96" rx="16" fill="#FFC83D"/>
        <rect x="-80" y="-150" width="160" height="24" rx="12" fill="#fff"/>
        ${[-40, 0, 40].map(x => `<rect x="${x - 6}" y="-200" width="12" height="50" rx="5" fill="#4DB6FF"/><ellipse cx="${x}" cy="-212" rx="9" ry="14" fill="#FF7A6B"/>`).join('')}
      </g>`,
  },
  {
    id: 'grad', name: 'التخرّج', emoji: '🎓', acc: 'cap',
    words: ['تخرج', 'تخرّج', 'التخرج', 'حفلة', 'شهادة', 'آخر السنة', 'نهاية السنة'],
    svg: () => `
      <rect width="1080" height="1080" fill="#3B2F9E"/>
      <path d="M0 0 h1080 v120 q-90 50 -180 0 q-90 50 -180 0 q-90 50 -180 0 q-90 50 -180 0 q-90 50 -180 0 q-90 50 -180 0z" fill="#6C5CE7"/>
      <path d="M0 0 q140 420 0 1080z" fill="#6C5CE7"/><path d="M1080 0 q-140 420 0 1080z" fill="#6C5CE7"/>
      <path d="M540 120 L250 1080 H830z" fill="#FFF8D6" opacity=".18"/>
      ${stars(40, '#FFC83D', 11, 700, 6)}
      ${[[200, 260, -20], [880, 220, 18], [760, 420, -10], [300, 480, 14]].map(([x, y, r]) => `
        <g transform="translate(${x} ${y}) rotate(${r})"><path d="M-70 0 L0 -32 L70 0 L0 32z" fill="#2E2A4F"/><rect x="-34" y="8" width="68" height="34" rx="6" fill="#2E2A4F"/>
        <path d="M50 8 v46" stroke="#FFC83D" stroke-width="6"/><circle cx="50" cy="58" r="9" fill="#FFC83D"/></g>`).join('')}
      <rect y="860" width="1080" height="220" fill="#9A6B3E"/><rect y="860" width="1080" height="26" fill="#B98552"/>`,
  },
];

// ---------- Exam scenes ----------
// Inspired by real kindergarten worksheets: hexagon letter boxes, a coloured hand,
// a duck, "match the letter" words, red hand-drawn stars and glitter stickers.

const check = (x, y, s = 1) =>
  `<path d="M${x - 22 * s} ${y} l${14 * s} ${16 * s} l${30 * s} ${-34 * s}" stroke="#2EC4A0" stroke-width="${10 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const crayon = (x, y, rot, c) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-70" y="-15" width="130" height="30" rx="8" fill="${c}"/>
   <path d="M60 -15 l34 15 l-34 15z" fill="${c}"/><rect x="-40" y="-15" width="16" height="30" fill="#fff" opacity=".45"/><rect x="20" y="-15" width="10" height="30" fill="#000" opacity=".12"/></g>`;
const hexBox = (x, y) =>
  `<path transform="translate(${x} ${y})" d="M-64 0 L-38 -34 H38 L64 0 L38 34 H-38Z" fill="#fff" stroke="#2E2A4F" stroke-width="4" stroke-linejoin="round"/>`;
// Red teacher star, drawn by hand (slightly wobbly outline).
function redStar(x, y, r, rot = 0) {
  let d = '';
  for (let i = 0; i <= 5; i++) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  }
  return `<path transform="translate(${x} ${y}) rotate(${rot})" d="${d}" fill="none" stroke="#E0464B" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
}
// Glitter star sticker like the ones teachers stick on papers.
function glitterStar(x, y, r, c, rot = 0) {
  const rr = rand(Math.round(x * 7 + y));
  let dots = '';
  for (let i = 0; i < 14; i++) {
    const a = rr() * Math.PI * 2, d = rr() * r * 0.55;
    dots += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(2 + rr() * 3).toFixed(1)}" fill="#fff" opacity=".85"/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${star5(0, 0, r + 6, '#fff')}${star5(0, 0, r, c)}${dots}</g>`;
}
const duck = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-70 40 q20 18 40 0 q20 18 40 0 q20 18 40 0 q20 18 40 0" stroke="#4DB6FF" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="0" cy="10" rx="58" ry="34" fill="#FFD84D" stroke="#2E2A4F" stroke-width="4"/>
  <path d="M-10 4 q24 -6 34 14 q-24 8 -34 -14z" fill="#FFC21A" stroke="#2E2A4F" stroke-width="3"/>
  <circle cx="-42" cy="-30" r="28" fill="#FFD84D" stroke="#2E2A4F" stroke-width="4"/>
  <path d="M-70 -28 l-22 6 l22 6z" fill="#FF9E2C" stroke="#2E2A4F" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="-50" cy="-36" r="5" fill="#2E2A4F"/></g>`;
const hand = (x, y, s = 1, fill = '#FFE066') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" stroke="#2E2A4F" stroke-width="4" stroke-linejoin="round">
  ${[-30, -12, 6, 24].map((fx, i) => `<rect x="${fx - 9}" y="${-70 + [10, 0, 4, 16][i]}" width="18" height="70" rx="9"/>`).join('')}
  <rect x="34" y="-10" width="18" height="56" rx="9" transform="rotate(38 43 18)"/>
  <rect x="-40" y="-14" width="76" height="70" rx="26"/></g>`;
const labelSticker = (x, y, rot, bg, edge) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-92" y="-40" width="184" height="80" rx="18" fill="${edge}"/><rect x="-84" y="-32" width="168" height="64" rx="14" fill="${bg}"/>
   ${star5(-70, -26, 12, '#FF7A6B')}${star5(72, 24, 10, '#6C5CE7')}</g>`;

function stamp(ctx, x, y, rot = -12) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * Math.PI / 180);
  ctx.globalAlpha = 0.93;
  ctx.fillStyle = '#FFF5F4';
  ctx.strokeStyle = '#E0464B';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, 0, 112, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#E0464B';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.font = '700 50px "Baloo Bhaijaan 2", "Tajawal", sans-serif';
  ctx.fillText('ممتاز', 0, -20);
  ctx.font = '700 40px sans-serif';
  ctx.fillText('★ ★ ★', 0, 34);
  ctx.restore();
}

function text(ctx, str, x, y, size, color, weight = 700, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.font = `${weight} ${size}px "Baloo Bhaijaan 2", "Tajawal", sans-serif`;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

const PAPER_ROT = -3;

SCENES.push({
  id: 'exam', name: 'ورقة الامتحان', emoji: '📝', acc: 'paper',
  words: ['ورقة', 'ورقه', 'ورقة امتحان', 'علامة كاملة', 'كاملة', 'عشرة على عشرة', 'تقييم', 'حروف', 'حرف'],
  svg: () => `
    <rect width="1080" height="1080" fill="#FF6B4A"/>
    <rect x="0" y="0" width="1080" height="1080" fill="#FF7A5C"/>
    <rect x="0" y="0" width="420" height="1080" fill="#FF6B4A"/>
    <g transform="rotate(9 540 560)" opacity=".9">
      <rect x="40" y="150" width="760" height="900" rx="10" fill="#F6F3EC"/>
    </g>
    <g transform="rotate(${PAPER_ROT} 540 560)">
      <rect x="96" y="86" width="900" height="980" rx="14" fill="#2E2A4F" opacity=".14"/>
      <rect x="80" y="70" width="900" height="980" rx="14" fill="#FFFFFF"/>
      <rect x="110" y="96" width="840" height="130" rx="10" fill="none" stroke="#2E2A4F" stroke-width="3"/>
      <line x1="110" y1="140" x2="950" y2="140" stroke="#2E2A4F" stroke-width="2"/>
      <line x1="560" y1="96" x2="560" y2="226" stroke="#2E2A4F" stroke-width="2"/>
      <rect x="600" y="160" width="300" height="5" rx="2" fill="#B9B4D6"/><rect x="600" y="198" width="220" height="5" rx="2" fill="#B9B4D6"/>
      <path d="M620 186 q20 -18 40 0 t40 0 t40 0" stroke="#6C5CE7" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${hand(870, 330, 0.9)}
      ${hexBox(700, 300)}${hexBox(540, 300)}${hexBox(380, 300)}
      ${duck(200, 310, 0.9)}
      <line x1="110" y1="400" x2="950" y2="400" stroke="#2E2A4F" stroke-width="2" stroke-dasharray="2 8" opacity=".5"/>
      <path d="M800 470 C 700 480, 320 520, 250 600" stroke="#9A93C9" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M800 560 C 700 560, 320 470, 250 480" stroke="#9A93C9" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M800 650 C 700 650, 320 720, 250 720" stroke="#9A93C9" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
      ${check(930, 470, .8)}${check(930, 560, .8)}${check(930, 650, .8)}
      ${redStar(860, 790, 50, 8)}${redStar(180, 840, 38, -10)}
    </g>
    ${glitterStar(140, 420, 50, '#8E5BE8', -12)}
    ${glitterStar(960, 560, 42, '#E8384F', 14)}
    ${glitterStar(110, 660, 36, '#2EC48A', 6)}
    ${glitterStar(965, 400, 40, '#FFC83D', 10)}
    <g transform="translate(160 960) rotate(-20)">
      <rect x="-20" y="-17" width="260" height="34" rx="6" fill="#FFC83D"/>
      <rect x="-20" y="-17" width="260" height="11" fill="#FFB020"/>
      <path d="M240 -17 l50 17 l-50 17z" fill="#F7D9A8"/><path d="M276 -5 l14 5 l-14 5z" fill="#2E2A4F"/>
      <rect x="-56" y="-17" width="40" height="34" rx="8" fill="#FF9EC7"/><rect x="-22" y="-17" width="10" height="34" fill="#C9C4FF"/>
    </g>
    ${crayon(880, 830, -18, '#6C5CE7')}${crayon(920, 880, -6, '#4DB6FF')}${crayon(850, 920, 10, '#2EC4A0')}`,
  decorate(ctx) {
    // Words on the paper follow the paper's tilt.
    ctx.save();
    ctx.translate(540, 560); ctx.rotate(PAPER_ROT * Math.PI / 180); ctx.translate(-540, -560);
    text(ctx, 'الاسم: نجم الصف', 760, 118, 26, '#2E2A4F', 500);
    text(ctx, 'يـ', 700, 302, 44, '#5B5B7A');
    text(ctx, 'ـيـ', 540, 302, 44, '#5B5B7A');
    text(ctx, 'ـي', 380, 302, 44, '#5B5B7A');
    ['يا', 'وا', 'وو'].forEach((w, i) => text(ctx, w, 850, 472 + i * 90, 40, '#2E2A4F'));
    ['واحد', 'ياسر', 'يوم'].forEach((w, i) => text(ctx, w, 200, 478 + i * 120, 34, '#2E2A4F'));
    ctx.restore();
    stamp(ctx, 250, 190);
  },
});

SCENES.push({
  id: 'examphoto', name: 'امتحانات صفّي', emoji: '📸', acc: 'paper',
  words: ['امتحان', 'امتحانات', 'اختبار', 'علامة', 'علامه', 'اوراق', 'أوراق', 'صفي', 'نتيجة', 'نتايج'],
  photo: 'scenes/exam-photo.jpg',
  svg: () => `
    <defs>
      <radialGradient id="glow" cx="50%" cy="58%" r="45%"><stop offset="0" stop-color="#FFF8EC" stop-opacity=".85"/><stop offset=".6" stop-color="#FFF8EC" stop-opacity=".35"/><stop offset="1" stop-color="#FFF8EC" stop-opacity="0"/></radialGradient>
      <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#FF6B4A" stop-opacity="0"/><stop offset="1" stop-color="#C73E1D" stop-opacity=".45"/></radialGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#vig)"/>
    <ellipse cx="540" cy="620" rx="440" ry="420" fill="url(#glow)"/>
    ${glitterStar(120, 440, 46, '#8E5BE8', -12)}
    ${glitterStar(960, 470, 40, '#E8384F', 14)}
    ${glitterStar(90, 700, 34, '#2EC48A', 6)}
    ${glitterStar(990, 720, 30, '#FFC83D', -8)}
    ${labelSticker(880, 200, 10, '#FFE066', '#FF9EC7')}
    ${[[330, 110, 10], [760, 330, 8], [300, 360, 7], [700, 130, 9]].map(([x, y, r]) => star5(x, y, r, '#fff')).join('')}`,
  decorate(ctx) {
    text(ctx, 'أبطال الامتحان', 880, 202, 34, '#B0306A', 700, 10 * Math.PI / 180);
    stamp(ctx, 220, 200);
  },
});

// Olive picking: olive trees, a ladder, baskets and the cloth spread under the trees.
function oliveTree(x, y, s, flip = false) {
  const r = rand(Math.round(x + y));
  let olives = '';
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 40 + r() * 120;
    const ox = Math.cos(a) * d * 1.3, oy = -150 + Math.sin(a) * d * 0.7;
    olives += `<ellipse cx="${ox.toFixed(0)}" cy="${oy.toFixed(0)}" rx="9" ry="12" fill="${r() > 0.5 ? '#4B3B6B' : '#7FA03A'}" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${ox.toFixed(0)} ${oy.toFixed(0)})"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <path d="M-30 120 C -20 40, -60 -10, -10 -80 C 10 -40, 30 -10, 30 120 Z" fill="#8A6A4A"/>
    <path d="M-12 -60 C -60 -90, -90 -70, -110 -110 M 10 -70 C 40 -110, 80 -110, 110 -140" stroke="#8A6A4A" stroke-width="16" fill="none" stroke-linecap="round"/>
    <ellipse cx="-80" cy="-150" rx="120" ry="80" fill="#8DB07A"/>
    <ellipse cx="60" cy="-170" rx="130" ry="85" fill="#9BBF86"/>
    <ellipse cx="0" cy="-230" rx="120" ry="70" fill="#A9C994"/>
    <ellipse cx="-20" cy="-120" rx="90" ry="50" fill="#7FA36C"/>
    ${olives}
  </g>`;
}
const basket = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-70 -20 h140 l-16 70 h-108z" fill="#D9A45B"/>
  <path d="M-62 0 h124 M-58 20 h116 M-54 38 h108" stroke="#B98245" stroke-width="5"/>
  <path d="M-55 -20 q55 -70 110 0" stroke="#B98245" stroke-width="9" fill="none"/>
  ${[-40, -20, 0, 20, 40, -30, -10, 10, 30].map((ox, i) => `<ellipse cx="${ox}" cy="${i < 5 ? -24 : -38}" rx="11" ry="14" fill="${i % 3 ? '#4B3B6B' : '#7FA03A'}"/>`).join('')}
</g>`;

SCENES.push({
  id: 'olive', name: 'قطف الزيتون', emoji: '🫒', acc: 'heart',
  words: ['زيتون', 'الزيتون', 'قطف', 'موسم الزيتون', 'زيت', 'معصرة'],
  svg: () => `
    <rect width="1080" height="1080" fill="#D8EEFB"/>
    <circle cx="880" cy="150" r="80" fill="#FFD66B"/>
    ${cloud(120, 140, .8)}${cloud(520, 90, .6)}
    <path d="M0 560 Q200 440 420 520 T820 480 T1080 520 V1080 H0z" fill="#B9D88F"/>
    <path d="M0 640 Q300 560 600 620 T1080 600 V1080 H0z" fill="#A3C97A"/>
    ${oliveTree(170, 600, 1.05)}
    ${oliveTree(920, 610, 1.1, true)}
    <g transform="translate(830 330) rotate(18)">
      <rect x="-50" y="0" width="14" height="430" rx="6" fill="#C98E4B"/><rect x="36" y="0" width="14" height="430" rx="6" fill="#C98E4B"/>
      ${[40, 110, 180, 250, 320, 390].map(y => `<rect x="-40" y="${y}" width="80" height="12" rx="5" fill="#B07A3A"/>`).join('')}
    </g>
    <path d="M-20 820 L400 760 L680 790 L1100 750 L1100 900 L-20 940z" fill="#FFF8EC"/>
    <path d="M-20 820 L400 760 L680 790 L1100 750" stroke="#FF7A6B" stroke-width="10" fill="none" stroke-dasharray="40 20"/>
    ${Array.from({ length: 30 }, (_, i) => { const r = rand(i + 99); const x = (r() * 1080).toFixed(0), y = (800 + r() * 110).toFixed(0); return `<ellipse cx="${x}" cy="${y}" rx="9" ry="12" fill="${r() > 0.5 ? '#4B3B6B' : '#7FA03A'}"/>`; }).join('')}
    ${basket(140, 860, 1.1)}${basket(950, 870, 1)}
    <path d="M0 960 Q540 920 1080 960 V1080 H0z" fill="#8FBF5E"/>`,
});

// Letter of the week: a chalkboard with a big letter (the letter is drawn on the canvas).
SCENES.push({
  id: 'letter', name: 'حرف الأسبوع', emoji: '🔤', acc: 'medal',
  words: ['حرف الاسبوع'],
  svg: () => `
    <rect width="1080" height="1080" fill="#FFF0C9"/>
    ${bunting(30, ['#FF7A6B', '#4DB6FF', '#FFC83D', '#2EC4A0', '#FF9EC7'])}
    <rect x="120" y="120" width="840" height="560" rx="24" fill="#9A6B3E"/>
    <rect x="150" y="150" width="780" height="500" rx="12" fill="#2F6B55"/>
    <path d="M190 600 q60 -20 120 0" stroke="#fff" stroke-width="4" fill="none" opacity=".25"/>
    <rect x="300" y="676" width="480" height="22" rx="8" fill="#B98552"/>
    <rect x="340" y="664" width="60" height="14" rx="6" fill="#fff"/><rect x="420" y="664" width="40" height="14" rx="6" fill="#FFC83D"/><rect x="640" y="660" width="80" height="20" rx="6" fill="#FF9EC7"/>
    ${star5(200, 200, 22, '#FFC83D')}${star5(880, 210, 18, '#fff')}${star5(860, 600, 14, '#FFC83D')}
    <path d="M0 860 Q540 820 1080 860 V1080 H0z" fill="#FFD9E8"/>`,
  decorate(ctx, letter = 'ب') {
    const F = '"Baloo Bhaijaan 2", "Tajawal", sans-serif';
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    // big letter at the top of the board, above the child's head
    ctx.font = `700 210px ${F}`;
    ctx.fillText(letter, 540, 235);
    // its forms down the sides of the board
    const forms = 'أاإآدذرزوءة'.includes(letter) ? [letter, 'ـ' + letter] : [letter + 'ـ', 'ـ' + letter + 'ـ', 'ـ' + letter];
    ctx.font = `700 60px ${F}`;
    ctx.fillStyle = '#FFE8A3';
    forms.forEach((f, i) => { ctx.fillText(f, 860, 340 + i * 105); ctx.fillText(f, 220, 340 + i * 105); });
    ctx.restore();
  },
});

export const ACCESSORIES = [
  { id: 'none', emoji: '🚫', name: 'بلا' },
  { id: 'crown', emoji: '👑', name: 'تاج' },
  { id: 'cap', emoji: '🎓', name: 'قبعة تخرّج' },
  { id: 'stars', emoji: '✨', name: 'نجوم' },
  { id: 'medal', emoji: '🏅', name: 'وسام' },
  { id: 'heart', emoji: '💛', name: 'قلوب' },
  { id: 'paper', emoji: '📄', name: 'ماسك ورقته' },
];

export function getScenes() { return SCENES; }
export function getScene(id) { return SCENES.find(s => s.id === id) || SCENES[0]; }

export function sceneSVG(scene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">${scene.svg()}</svg>`;
}

const cache = new Map();
// Photo scenes: the photo is the background, and the SVG is drawn on top of it.
export function sceneOverlayURL(scene) {
  if (!scene.photo) return null;
  const key = scene.id + ':overlay';
  if (!cache.has(key)) {
    const blob = new Blob([sceneSVG(scene)], { type: 'image/svg+xml' });
    cache.set(key, URL.createObjectURL(blob));
  }
  return cache.get(key);
}
export function sceneURL(scene) {
  if (scene.photo) return scene.photo;
  if (!cache.has(scene.id)) {
    const blob = new Blob([sceneSVG(scene)], { type: 'image/svg+xml' });
    cache.set(scene.id, URL.createObjectURL(blob));
  }
  return cache.get(scene.id);
}

// Find which scene the teacher's words point at.
export function matchScene(text) {
  const t = normalize(text);
  for (const s of SCENES) if (s.words.some(w => t.includes(normalize(w)))) return s;
  return null;
}

export function normalize(t) {
  return (t || '')
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}
