import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Button/link that pulls toward the cursor when it gets close, with a
 * light-follow sheen and an optional ripple on click.
 *
 * Renders as `<a>` when given `href`, otherwise `<button>` — so it stays
 * semantic and keyboard accessible either way.
 *
 * @param {number} strength - how far the element leans toward the pointer (px)
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  strength = 22,
  className = '',
  glow = 'var(--c-primary)',
  style,
  ...rest
}) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring the offset so the element settles instead of snapping back.
  const springCfg = { stiffness: 220, damping: 18, mass: 0.4 };
  const x = useSpring(mx, springCfg);
  const y = useSpring(my, springCfg);

  // Slight counter-rotation sells the "physical object" feel.
  const rotateX = useTransform(y, [-strength, strength], [8, -8]);
  const rotateY = useTransform(x, [-strength, strength], [-8, 8]);

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    // Normalise by half-size so the pull is consistent across button sizes.
    mx.set((dx / (rect.width / 2)) * strength);
    my.set((dy / (rect.height / 2)) * strength);
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      {...rest}
      // Caller styles are merged in, never allowed to replace the motion
      // values — spreading `rest` first would kill the magnetic transform.
      style={{ ...style, x, y, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileTap={{ scale: 0.95 }}
      className={`group relative overflow-hidden rounded-full px-7 py-3 font-medium ${className}`}
    >
      {/* Radial sheen that tracks the pointer inside the button. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), ${glow}33, transparent 70%)`,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </Tag>
  );
}
