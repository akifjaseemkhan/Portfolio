import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { contactChannels, profile } from '../../data/profile';
import SectionHeading from '../ui/SectionHeading';
import MagneticButton from '../ui/MagneticButton';

/* ── Channel icons ──────────────────────────────────────────────────── */
const ICONS = {
  mail: 'M3 7l9 6 9-6M3 7h18v10H3z',
  github:
    'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.35 4.7-4.58 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z',
  linkedin:
    'M6.94 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 21h3.5V9.2H3.2V21zM9.4 9.2V21h3.5v-6.3c0-1.7.6-2.7 2-2.7 1.2 0 1.8.9 1.8 2.7V21h3.5v-6.6c0-3.4-1.8-5.4-4.4-5.4-1.7 0-2.6.9-3 1.6V9.2H9.4z',
  discord:
    'M18.9 5.6A16 16 0 0 0 14.9 4.4l-.3.7a12 12 0 0 1 3.3 1.2 11 11 0 0 0-9.8 0 12 12 0 0 1 3.3-1.2l-.3-.7a16 16 0 0 0-4 1.2C3.4 9.3 2.6 13 3 16.6a15 15 0 0 0 4.5 2.3l.6-1a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3a10 10 0 0 1-1.6.8l.6 1a15 15 0 0 0 4.5-2.3c.5-4.3-.7-8-2.1-11zM9.3 14.4c-.8 0-1.5-.7-1.5-1.6s.7-1.6 1.5-1.6 1.5.7 1.5 1.6-.7 1.6-1.5 1.6zm5.4 0c-.8 0-1.5-.7-1.5-1.6s.7-1.6 1.5-1.6 1.5.7 1.5 1.6-.7 1.6-1.5 1.6z',
  telegram: 'M21.5 4.3 2.9 11.4c-.9.4-.9 1 .1 1.3l4.6 1.4 1.8 5.4c.2.6.4.7 1 .2l2.4-2 4.7 3.5c.9.5 1.4.2 1.6-.8l3-14c.2-1.1-.4-1.6-1.6-1.1zM8.6 14.1 17 8.6c.4-.3.8-.1.5.2l-6.9 6.3-.3 3.3-1.7-4.3z',
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5 0-1.1 0-1.8-.3a12 12 0 0 1-5.7-5c-.4-.7-.6-1.4-.6-2 0-.6.5-1.6 1-1.8.2-.1.5-.2.7 0l.9 1.5c.1.2 0 .5-.1.7l-.4.5c-.1.2-.2.4 0 .7a8 8 0 0 0 3 2.7c.3.1.5 0 .7-.2l.5-.6c.2-.2.4-.2.6-.1l1.5.8c.2.1.2.4.1.6z',
};

function ChannelIcon({ name, color }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={name === 'mail' ? 'none' : color}
      stroke={name === 'mail' ? color : 'none'}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/**
 * A decorative glass keyboard. Keys light up in a travelling wave and
 * flash when the visitor types in the form — the "command center" reacting
 * to input. Purely visual, so it is hidden from assistive tech.
 */
function GlassKeyboard({ pulse }) {
  const ROWS = [10, 10, 9, 7];

  return (
    <div aria-hidden="true" className="mt-8 space-y-1.5 [perspective:700px]">
      <div className="space-y-1.5" style={{ transform: 'rotateX(38deg)', transformOrigin: 'bottom' }}>
        {ROWS.map((count, r) => (
          <div key={r} className="flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, c) => (
              <motion.span
                key={c}
                className="h-4 w-4 rounded-[3px] border border-white/10 bg-white/[0.05] sm:h-5 sm:w-5"
                animate={
                  pulse
                    ? { backgroundColor: ['rgba(255,255,255,.05)', 'rgba(0,229,255,.5)', 'rgba(255,255,255,.05)'] }
                    : { backgroundColor: 'rgba(255,255,255,.05)' }
                }
                transition={{
                  duration: 0.5,
                  // Diagonal ripple across the board.
                  delay: pulse ? (r * 0.05 + c * 0.03) % 0.6 : 0,
                  repeat: pulse ? Infinity : 0,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>
        ))}
        {/* Spacebar */}
        <div className="flex justify-center">
          <span className="h-4 w-28 rounded-[3px] border border-white/10 bg-white/[0.05] sm:h-5 sm:w-36" />
        </div>
      </div>
    </div>
  );
}

/**
 * Formspree endpoint — submissions POSTed here land directly in the inbox
 * tied to this form, no mail client on the visitor's end required.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeeybkpk';

/**
 * ── CONTACT COMMAND CENTER ────────────────────────────────────────────
 * Left: floating channel screens. Right: the transmission console.
 */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef(null);

  // Picks up the "Request This Service" hand-off from the Services section.
  // A custom event rather than shared state — this is a one-shot value with
  // exactly one producer and one consumer, so a store would be overkill.
  useEffect(() => {
    const onServiceRequest = (e) => {
      const title = e.detail?.title;
      if (!title) return;
      setForm((f) =>
        // Never clobber something the visitor already started typing.
        f.message ? f : { ...f, message: `Hi, I'd like to request: ${title}\n\n` },
      );
    };
    window.addEventListener('service-request', onServiceRequest);
    return () => window.removeEventListener('service-request', onServiceRequest);
  }, []);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setTyping(true);
    // Keyboard stops rippling shortly after the visitor stops typing.
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 900);
  };

  const sendMessage = async () => {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        message: form.message,
        subject: `Portfolio enquiry from ${form.name || 'a visitor'}`,
      }),
    });
    if (!res.ok) throw new Error('Formspree request failed');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    try {
      // The delay is intentional: it lets the transmission animation read.
      await new Promise((r) => setTimeout(r, 1900));
      await sendMessage();
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="contact-title">
        <SectionHeading
          eyebrow="Open channel"
          title="Command Center"
          subtitle="Pick a channel, or transmit a message directly from the console."
          accent="#14F195"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* ══ Channels ══════════════════════════════════════════════ */}
        <div className="glass glass-edge relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.14]" />

          <div className="relative mb-6 flex items-center justify-between">
            <p className="label-mono">Channels · {contactChannels.length} online</p>
            <span className="flex items-center gap-2 font-mono text-[10px] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              LIVE
            </span>
          </div>

          <ul className="relative grid gap-3 sm:grid-cols-2">
            {contactChannels.map((ch, i) => (
              <motion.li
                key={ch.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href={ch.href}
                  target={ch.href.startsWith('http') ? '_blank' : undefined}
                  rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative flex items-center gap-3.5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition-all duration-400 hover:-translate-y-1 hover:border-white/20"
                  style={{ boxShadow: '0 0 0 0 transparent' }}
                  onPointerMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                  }}
                >
                  {/* Pointer sheen */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(140px circle at var(--mx,50%) var(--my,50%), ${ch.color}22, transparent 70%)`,
                    }}
                  />
                  {/* Left edge light */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[2px] origin-bottom scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                    style={{ background: ch.color, boxShadow: `0 0 12px ${ch.color}` }}
                  />

                  <span
                    className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition-transform duration-500 group-hover:scale-110"
                    style={{
                      borderColor: `${ch.color}44`,
                      background: `${ch.color}12`,
                    }}
                  >
                    <ChannelIcon name={ch.icon} color={ch.color} />
                  </span>

                  <span className="relative min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">{ch.label}</span>
                    <span className="block truncate font-mono text-[11px] text-white/40">{ch.handle}</span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="relative shrink-0 translate-x-0 text-white/30 transition-all duration-400 group-hover:translate-x-1 group-hover:text-white/80"
                  >
                    ↗
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>

          <GlassKeyboard pulse={typing || status === 'sending'} />
        </div>

        {/* ══ Console ═══════════════════════════════════════════════ */}
        <div className="glass glass-edge relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="hologram-lines pointer-events-none absolute inset-0 opacity-30" />

          {/* Console chrome */}
          <div className="relative mb-6 flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <p className="ml-2 font-mono text-[11px] text-white/40">transmission://new-message</p>
          </div>

          <form onSubmit={onSubmit} className="relative space-y-4">
            {[
              { key: 'name', label: 'Identifier', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
              { key: 'email', label: 'Return address', type: 'email', placeholder: 'you@domain.com', autoComplete: 'email' },
            ].map((field) => (
              <div key={field.key}>
                <label htmlFor={`c-${field.key}`} className="label-mono mb-2 block !text-[0.6rem]">
                  {field.label}
                </label>
                <input
                  id={`c-${field.key}`}
                  name={field.key}
                  type={field.type}
                  required
                  autoComplete={field.autoComplete}
                  value={form[field.key]}
                  onChange={update(field.key)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 transition-all duration-300 focus:border-primary/60 focus:bg-primary/[0.06] focus:outline-none focus:ring-0"
                />
              </div>
            ))}

            <div>
              <label htmlFor="c-message" className="label-mono mb-2 block !text-[0.6rem]">
                Payload
              </label>
              <textarea
                id="c-message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="Tell me what you want to build…"
                className="w-full resize-none rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 font-mono text-sm leading-relaxed text-white placeholder:text-white/25 transition-all duration-300 focus:border-primary/60 focus:bg-primary/[0.06] focus:outline-none"
              />
            </div>

            <MagneticButton
              type="submit"
              disabled={status === 'sending'}
              className="w-full border border-accent/50 bg-accent/10 text-accent shadow-neon-green disabled:opacity-70"
              glow="#14F195"
              strength={12}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === 'sending' ? (
                  <motion.span
                    key="sending"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-accent border-t-transparent"
                    />
                    Sending Transmission...
                  </motion.span>
                ) : status === 'sent' ? (
                  <motion.span
                    key="sent"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <motion.path
                        d="M4 12.5 L9.5 18 L20 6.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </motion.svg>
                    Transmission Received
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    Send Transmission <span aria-hidden="true">→</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </MagneticButton>

            {/* Status line — announced to screen readers */}
            <p aria-live="polite" className="min-h-[1.25rem] font-mono text-[11px]">
              {status === 'sending' && <span className="text-primary">◆ Encrypting and routing…</span>}
              {status === 'sent' && (
                <span className="text-accent">✓ Message delivered — I'll get back to you soon.</span>
              )}
              {status === 'error' && (
                <span className="text-red-400">
                  ✗ Transmission failed — email {profile.name.split(' ')[0]} directly instead.
                </span>
              )}
            </p>
          </form>

          {/* Success burst */}
          <AnimatePresence>
            {status === 'sent' && (
              <motion.div
                key="burst"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 grid place-items-center"
                aria-hidden="true"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 3.2, opacity: 0 }}
                    transition={{ duration: 1.4, delay: i * 0.18, ease: 'easeOut' }}
                    className="absolute h-32 w-32 rounded-full border border-accent"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
