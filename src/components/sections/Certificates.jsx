import { useRef } from 'react';
import { motion } from 'framer-motion';
import { certificates } from '../../data/experience';
import SectionHeading from '../ui/SectionHeading';

/**
 * Holographic credential cards.
 *
 * Hover lifts the card, sweeps a specular reflection across the glass and
 * rotates it toward the pointer. All of it is CSS 3D — cheap, and it keeps
 * the cards in normal document flow so they stay selectable and linkable.
 */
function Card({ cert, index }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${-(py - 0.5) * 16}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 18}deg`);
    // Reflection follows the pointer across the surface.
    el.style.setProperty('--shine-x', `${px * 100}%`);
    el.style.setProperty('--shine-y', `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const Wrapper = cert.url ? 'a' : 'div';

  return (
    <motion.li
      initial={{ opacity: 0, y: 46, rotateY: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="perspective-1000"
    >
      <Wrapper
        ref={ref}
        href={cert.url ?? undefined}
        target={cert.url ? '_blank' : undefined}
        rel={cert.url ? 'noopener noreferrer' : undefined}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="glass neon-frame group relative block h-full overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow] duration-500 ease-out will-transform hover:-translate-y-2"
        style={{
          color: cert.color,
          transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
          transformStyle: 'preserve-3d',
          boxShadow: `0 24px 60px -30px ${cert.color}55`,
        }}
      >
        {/* Specular reflection that tracks the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(320px circle at var(--shine-x,50%) var(--shine-y,50%), rgba(255,255,255,0.16), transparent 60%)`,
          }}
        />
        {/* Scanline film */}
        <span aria-hidden="true" className="hologram-lines pointer-events-none absolute inset-0 opacity-40" />
        {/* Travelling light bar */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-full h-full opacity-0 transition-opacity duration-300 group-hover:animate-scan group-hover:opacity-100"
          style={{
            background: `linear-gradient(180deg, transparent, ${cert.color}22, transparent)`,
          }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(26px)' }}>
          {/* Seal */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
              style={{
                borderColor: `${cert.color}66`,
                background: `${cert.color}14`,
                boxShadow: `0 0 26px ${cert.color}44`,
              }}
              aria-hidden="true"
            >
              {/* Rosette */}
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={cert.color} strokeWidth="1.6">
                <circle cx="12" cy="9" r="5.4" />
                <path d="M9 13.6 L8 21 l4-2.2 L16 21 l-1-7.4" strokeLinejoin="round" />
                <path d="M10.2 9 l1.2 1.3 2.4-2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <time className="font-mono text-xs text-white/35">{cert.year}</time>
          </div>

          <h3 className="mb-1.5 text-base font-semibold leading-snug text-white">{cert.title}</h3>
          <p className="mb-5 font-mono text-xs" style={{ color: cert.color }}>
            {cert.issuer}
          </p>

          <ul className="flex flex-wrap gap-1.5">
            {cert.skills.map((s) => (
              <li
                key={s}
                className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55"
              >
                {s}
              </li>
            ))}
          </ul>

          {cert.url && (
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] opacity-70 transition-opacity group-hover:opacity-100">
              View credential <span aria-hidden="true">↗</span>
            </span>
          )}
        </div>

        {/* Corner brackets */}
        {[
          'left-3 top-3 border-l border-t',
          'right-3 top-3 border-r border-t',
          'left-3 bottom-3 border-b border-l',
          'right-3 bottom-3 border-b border-r',
        ].map((cls) => (
          <span
            key={cls}
            aria-hidden="true"
            className={`pointer-events-none absolute h-4 w-4 opacity-30 transition-opacity duration-500 group-hover:opacity-90 ${cls}`}
            style={{ borderColor: cert.color }}
          />
        ))}
      </Wrapper>
    </motion.li>
  );
}

export default function Certificates() {
  return (
    <section
      id="certificates"
      aria-labelledby="certificates-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="certificates-title">
        <SectionHeading
          eyebrow="Credentials"
          title="Certificates"
          subtitle="Verified learning, from web fundamentals to generative AI."
          accent="#14F195"
        />
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert, i) => (
          <Card key={cert.id} cert={cert} index={i} />
        ))}
      </ul>
    </section>
  );
}
