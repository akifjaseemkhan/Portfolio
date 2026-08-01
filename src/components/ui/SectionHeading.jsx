import { motion } from 'framer-motion';

/**
 * Shared section header: mono eyebrow, gradient title, glowing rule.
 * Keeping it in one place is what makes every section feel like part of
 * the same system rather than separate pages.
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', accent }) {
  const isCenter = align === 'center';

  return (
    <div className={`relative z-10 mb-14 ${isCenter ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="label-mono mb-4"
          style={accent ? { color: accent } : undefined}
        >
          <span className="mr-3 inline-block h-px w-8 align-middle" style={{ background: accent ?? 'var(--c-primary)' }} />
          {eyebrow}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
        className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span className="text-gradient">{title}</span>
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className={`mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg ${
            isCenter ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={`rule-glow mt-8 w-40 ${isCenter ? 'mx-auto' : ''}`}
      />
    </div>
  );
}
