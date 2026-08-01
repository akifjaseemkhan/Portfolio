/**
 * ── BRAND MARK ────────────────────────────────────────────────────────
 * A hexagonal "chip" frame (nods to circuits/tech) around a geometric "A"
 * monogram, with three small nodes at alternating corners standing in for
 * the three initials — A·J·K — without needing three literal letterforms
 * crammed into a mark this small.
 *
 * This is the single source of truth for the icon: it's reused in the
 * navbar, footer and loading screen. `public/favicon.svg` mirrors these
 * exact coordinates for the browser tab icon (which can't render React).
 * If you change the geometry here, update that file to match.
 */
export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      {/* Hex chip frame */}
      <path
        d="M32,5 L55.4,18.5 L55.4,45.5 L32,59 L8.6,45.5 L8.6,18.5 Z"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* A monogram */}
      <path
        d="M20,47 L32,16.5 L44,47 M25,37.5 H39"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Three corner nodes — the "J" and "K" of the mark */}
      <circle cx="32" cy="5" r="2.3" fill="url(#logoGrad)" />
      <circle cx="8.6" cy="45.5" r="2.3" fill="url(#logoGrad)" />
      <circle cx="55.4" cy="45.5" r="2.3" fill="url(#logoGrad)" />
    </svg>
  );
}
