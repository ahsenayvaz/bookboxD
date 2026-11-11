// Leseecke: eine Teyze liest im Schaukelstuhl, daneben Lampe, Tee und eine schlafende Katze.
// Die Animationen (Schaukeln, Dampf, Umblättern, Atmen …) stehen in globals.css unter .nook
export function ReadingNook({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 360"
      // overflow-visible: der Lichtschein der Lampe darf über den Rand hinaus strahlen
      className={`nook overflow-visible ${className}`}
      role="img"
      aria-label="Eine ältere Frau liest gemütlich im Schaukelstuhl, neben ihr eine Tasse Tee und eine schlafende Katze"
    >
      <defs>
        <radialGradient id="nk-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6c56f" stopOpacity=".42" />
          <stop offset="1" stopColor="#f6c56f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nk-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0a04b" />
          <stop offset="1" stopColor="#f6c56f" />
        </linearGradient>
        <pattern id="nk-knit" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#c05a33" />
          <rect y="8" width="12" height="4" fill="#e3845a" />
          <circle cx="6" cy="4" r="1.3" fill="#f4e8d2" opacity=".8" />
        </pattern>
        <pattern id="nk-crochet" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#e6b45a" />
          <circle cx="3.5" cy="3.5" r="1.4" fill="#c99232" />
        </pattern>
      </defs>

      {/* Licht der Leselampe */}
      <circle className="lamp-glow" cx="95" cy="150" r="165" fill="url(#nk-glow)" />

      {/* Fenster mit Nachthimmel */}
      <rect x="292" y="46" width="92" height="112" rx="46" fill="#5a3820" />
      <rect x="299" y="53" width="78" height="98" rx="39" fill="#2a2233" />
      <path d="M352 78a13 13 0 1 0 9 22 11 11 0 0 1-9-22z" fill="#f6d79a" />
      {[
        [318, 84, 1.6, "0s"],
        [332, 70, 1.2, "1.2s"],
        [314, 118, 1.3, "2.1s"],
        [360, 128, 1.4, "0.6s"],
      ].map(([cx, cy, r, delay]) => (
        <circle key={`${cx}-${cy}`} className="star" cx={cx} cy={cy} r={r} fill="#f7ecdb" style={{ animationDelay: delay as string }} />
      ))}
      <path d="M338 53v98M299 106h78" stroke="#5a3820" strokeWidth="4" />
      <rect x="288" y="156" width="100" height="7" rx="2" fill="#7a4f30" />
      <path d="M286 40h104" stroke="#4a2c18" strokeWidth="4" strokeLinecap="round" />
      <path d="M288 42c10 30 6 70 14 104-8 6-16 4-20-2 4-34 0-70 6-102z" fill="#9d4526" />
      <path d="M388 42c-10 30-6 70-14 104 8 6 16 4 20-2-4-34 0-70-6-102z" fill="#9d4526" />

      {/* Teppich */}
      <ellipse cx="215" cy="340" rx="190" ry="15" fill="#7e3519" opacity=".75" />
      <ellipse cx="215" cy="340" rx="172" ry="10" fill="none" stroke="#e6b45a" strokeOpacity=".45" strokeDasharray="3 5" />

      {/* Stehlampe */}
      <ellipse cx="60" cy="334" rx="20" ry="5" fill="#3a2618" />
      <rect x="57" y="104" width="6" height="230" rx="3" fill="#5a3820" />
      <path d="M30 108 44 70h32l14 38z" fill="url(#nk-shade)" />
      <path d="M30 108h60" stroke="#c05a33" strokeWidth="3" strokeLinecap="round" />

      {/* Beistelltisch mit Büchern und Tee */}
      <rect x="76" y="266" width="8" height="64" fill="#5a3820" />
      <ellipse cx="80" cy="331" rx="18" ry="4" fill="#4a2c18" />
      <ellipse cx="80" cy="264" rx="36" ry="7" fill="#7a4f30" />
      <rect x="50" y="249" width="36" height="8" rx="1.5" fill="#8d9b5c" />
      <rect x="54" y="241" width="30" height="8" rx="1.5" fill="#c05a33" />
      <ellipse cx="104" cy="259" rx="13" ry="2.6" fill="#e8d6b6" />
      <path d="M95 243h18v6a9 9 0 0 1-18 0z" fill="#f4e8d2" />
      <circle cx="115" cy="248" r="3.6" fill="none" stroke="#f4e8d2" strokeWidth="2" />
      <path className="steam" d="M101 238c-4-5 4-9 0-14s4-9 0-14" fill="none" stroke="#f7ecdb" strokeWidth="2" strokeLinecap="round" />
      <path className="steam steam-2" d="M108 236c-4-5 4-9 0-14s4-9 0-14" fill="none" stroke="#f7ecdb" strokeWidth="2" strokeLinecap="round" />

      {/* Schatten unter dem Stuhl */}
      <ellipse cx="206" cy="340" rx="96" ry="6" fill="#000" opacity=".3" />

      {/* Schaukelstuhl mit Teyze – schaukelt als Ganzes */}
      <g className="rock">
        <path d="M162 330 144 154" stroke="#4f2f1a" strokeWidth="6" strokeLinecap="round" />
        <path d="M110 322Q200 350 302 322" fill="none" stroke="#5a3820" strokeWidth="9" strokeLinecap="round" />
        <path d="M150 330 132 148" stroke="#7a4f30" strokeWidth="8" strokeLinecap="round" />
        <circle cx="131" cy="143" r="6.5" fill="#7a4f30" />
        <path d="M136 168c10-4 16 2 16 14l4 62c0 8-12 10-16 2z" fill="#9d4526" />
        <path d="M146 262 258 257" stroke="#7a4f30" strokeWidth="9" strokeLinecap="round" />
        <path d="M253 331 250 262" stroke="#7a4f30" strokeWidth="7" strokeLinecap="round" />

        {/* Hausschuhe */}
        <path d="M236 316h22a5 5 0 0 1 0 10h-25a3 3 0 0 1 0-6z" fill="#8f3d1f" />
        <circle cx="259" cy="318" r="3.4" fill="#f4e8d2" />

        {/* Strickjacke und Häkeltuch */}
        <path d="M150 182c6-8 20-12 34-8l14 9c8 22 8 50 0 76h-46c-6-26-8-52-2-77z" fill="#7b8a4e" />
        <path d="M186 186c6 22 6 50 2 72" stroke="#5f6c38" strokeWidth="2" fill="none" />
        <path d="M148 182c14-12 36-14 52-2l-12 34c-10-10-24-16-40-16z" fill="url(#nk-crochet)" />

        {/* Kopf mit Dutt und Brille */}
        <rect x="176" y="160" width="12" height="16" rx="5" fill="#d99a72" />
        <circle cx="188" cy="146" r="21" fill="#e9b48f" />
        <path d="M206 138q9 6 1 12" fill="#e9b48f" stroke="#d99a72" strokeWidth="1.2" />
        <circle cx="166" cy="131" r="11" fill="#e4ddd3" />
        <path d="M168 154c-6-22 8-36 26-32 8 2 13 8 14 14-10-6-22-6-28 2-4 6-5 11-6 18z" fill="#e4ddd3" />
        <path d="M160 128q6 4 12 0" stroke="#c9bfb2" strokeWidth="1.4" fill="none" />
        <ellipse cx="180" cy="149" rx="3.5" ry="5" fill="#d99a72" />
        <path d="M180 147h15" stroke="#3a2618" strokeWidth="1.4" />
        <circle cx="200" cy="146" r="5.5" fill="#fff" fillOpacity=".15" stroke="#3a2618" strokeWidth="1.6" />
        <path d="M197.5 147q2.5 2 5 0" stroke="#3a2618" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="195" cy="156" r="4" fill="#e07a6a" opacity=".45" />
        <path d="M199 161q3 2.5 7-.5" stroke="#8a4a3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* Strickdecke über dem Schoß */}
        <path d="M156 238c30-10 66-10 92 0 8 22 10 50 4 72l-56 6c-4-26-18-46-40-52z" fill="url(#nk-knit)" />
        <path
          d="M200 316l2 6M210 315l2 6M220 314l2 6M230 313l2 6M240 312l2 6M250 311l2 6"
          stroke="#e3845a"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Armlehne */}
        <path d="M138 214 262 211" stroke="#7a4f30" strokeWidth="7" strokeLinecap="round" />
        <path d="M255 214 252 258" stroke="#7a4f30" strokeWidth="6" strokeLinecap="round" />

        {/* Buch in beiden Händen, ab und zu wird umgeblättert */}
        <circle cx="264" cy="190" r="5" fill="#d99a72" />
        <path d="M222 194l24 12 22-20-24-12z" fill="#9d4526" />
        <path d="M226 191l20 10v-24l-18-8z" fill="#f4e8d2" />
        <path d="M246 201l19-15-2-21-17 12z" fill="#fdf6ea" />
        <path d="M230 178l12 6M230 183l12 6M250 184l10-8M250 189l10-8" stroke="#c9a77f" strokeWidth="1" />
        <path className="page-turn" d="M246 201l19-15-2-21-17 12z" fill="#fffaf1" stroke="#e8d6b6" strokeWidth=".8" />
        <path d="M186 188 198 214 230 200" fill="none" stroke="#7b8a4e" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="232" cy="198" r="6" fill="#e9b48f" />
      </g>

      {/* Schlafende Katze mit Wollknäuel */}
      <path d="M370 330c12-6 14 10-4 11h-40" fill="none" stroke="#c97a3e" strokeWidth="6" strokeLinecap="round" />
      <g className="cat">
        <ellipse cx="342" cy="326" rx="30" ry="13" fill="#d98a4e" />
        <path d="M336 316q4 8 0 18M348 315q4 8 0 19M358 318q3 7 0 15" stroke="#b8692f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="317" cy="324" r="11" fill="#d98a4e" />
      <path d="M308 318l2-10 7 5zM318 314l7-7 1 9z" fill="#d98a4e" />
      <path d="M311 325q2.5 2 5 0M319 325q2.5 2 5 0" stroke="#5a3820" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="390" cy="331" r="9" fill="#8d9b5c" />
      <path d="M383 326q7 4 14-1M382 332q8 4 16 0M386 338q5-6 9-14" stroke="#6f7d45" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

// Schwebende Staubkörnchen im warmen Lampenlicht – feste Werte, damit Server und Client identisch rendern
const MOTES = [
  [8, 3, 14, 0, 30],
  [17, 2, 17, 4, -20],
  [26, 3, 13, 8, 40],
  [37, 2, 18, 2, -35],
  [48, 3, 15, 6, 25],
  [58, 2, 14, 10, -15],
  [66, 3, 19, 1, 45],
  [74, 2, 15, 7, -40],
  [83, 3, 16, 3, 20],
  [91, 2, 14, 9, -25],
];

export function FloatingMotes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map(([left, size, duration, delay, drift]) => (
        <span
          key={left}
          className="float-mote"
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            ["--drift" as string]: `${drift}px`,
          }}
        />
      ))}
    </div>
  );
}
