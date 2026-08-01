import { motion } from 'framer-motion';
import { services } from '../../data/services';
import { scrollToSection } from '../../hooks/useSmoothScroll';
import SectionHeading from '../ui/SectionHeading';
import MagneticButton from '../ui/MagneticButton';

/**
 * One service module. Clicking "Request This Service" scrolls to Contact
 * and hands the service title off via a lightweight custom event — Contact
 * picks it up and pre-fills the message field, without either component
 * needing a shared state store for a single one-shot handoff.
 */
function ServiceCard({ service, index, lenis }) {
  const request = () => {
    window.dispatchEvent(new CustomEvent('service-request', { detail: { title: service.title } }));
    scrollToSection('contact', lenis?.current);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="glass glass-edge neon-frame group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1.5 sm:p-7"
        style={{ color: service.color }}
      >
        <span aria-hidden="true" className="hologram-lines pointer-events-none absolute inset-0 opacity-[0.15]" />

        <div className="relative">
          <span
            className="mb-5 grid h-12 w-12 place-items-center rounded-xl border text-lg font-bold"
            style={{
              borderColor: `${service.color}55`,
              background: `${service.color}14`,
              boxShadow: `0 0 26px ${service.color}33`,
            }}
            aria-hidden="true"
          >
            {service.icon}
          </span>

          <h3 className="mb-1.5 text-lg font-semibold text-white">{service.title}</h3>
          <p className="mb-4 font-mono text-xs" style={{ color: service.color }}>
            {service.tagline}
          </p>
          <p className="mb-5 text-sm leading-relaxed text-white/55">{service.description}</p>

          <ul className="mb-6 space-y-2">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-xs leading-relaxed text-white/55">
                <span
                  aria-hidden="true"
                  className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full"
                  style={{ background: service.color, boxShadow: `0 0 6px ${service.color}` }}
                />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer pinned to the bottom so cards align across a row regardless of description length */}
        <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
            {service.startingAt ? `From ${service.startingAt}` : 'Custom Quote'}
          </span>
          <MagneticButton
            onClick={request}
            strength={10}
            className="!px-4 !py-2 border text-xs font-medium"
            style={{ borderColor: `${service.color}55`, background: `${service.color}14`, color: service.color }}
            glow={service.color}
          >
            Request <span aria-hidden="true">→</span>
          </MagneticButton>
        </div>
      </div>
    </motion.li>
  );
}

export default function Services({ lenis }) {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="services-title">
        <SectionHeading
          eyebrow="What I offer"
          title="Services"
          subtitle="From a landing page to a full 3D product experience — pick what you need, or ask for something that isn't listed."
          accent="#00E5FF"
        />
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} lenis={lenis} />
        ))}
      </ul>
    </section>
  );
}
