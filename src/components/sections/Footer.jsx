import { motion } from 'framer-motion';
import { contactChannels, navLinks, profile } from '../../data/profile';
import { scrollToSection } from '../../hooks/useSmoothScroll';
import Logo from '../ui/Logo';

export default function Footer({ lenis }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.07] px-6 pb-10 pt-16">
      {/* Glow along the top edge */}
      <div aria-hidden="true" className="rule-glow absolute inset-x-0 top-0" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identity */}
          <div className="lg:col-span-2">
            <button
              onClick={() => scrollToSection('hero', lenis?.current)}
              className="mb-4 flex items-center gap-2.5 font-mono text-sm font-bold tracking-widest"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/40 bg-primary/10">
                <Logo className="h-5 w-5" />
              </span>
              <span className="text-white">
                JD<span className="text-primary">.</span>DEV
              </span>
            </button>
            <p className="max-w-sm text-sm leading-relaxed text-white/45">{profile.tagline}</p>
            <p className="mt-4 font-mono text-[11px] text-white/30">{profile.location}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <p className="label-mono mb-4">Navigate</p>
            <ul className="space-y-2.5">
              {navLinks.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToSection(id, lenis?.current)}
                    className="group flex items-center gap-2 text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3"
                    />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Channels */}
          <div>
            <p className="label-mono mb-4">Connect</p>
            <ul className="space-y-2.5">
              {contactChannels.map((ch) => (
                <li key={ch.id}>
                  <a
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-2 text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full transition-all duration-300 group-hover:scale-150"
                      style={{ background: ch.color }}
                    />
                    {ch.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 sm:flex-row">
          <p className="font-mono text-[11px] text-white/30">
            © {year} {profile.name}. Built with React, Three.js &amp; too much coffee.
          </p>

          <motion.button
            onClick={() => scrollToSection('hero', lenis?.current)}
            whileHover={{ y: -3 }}
            className="group flex items-center gap-2 font-mono text-[11px] text-white/40 transition-colors hover:text-primary"
          >
            Back to top
            <span
              aria-hidden="true"
              className="grid h-6 w-6 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-primary/60"
            >
              ↑
            </span>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
