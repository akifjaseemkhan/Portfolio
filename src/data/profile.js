/**
 * ── PERSONAL INFO ─────────────────────────────────────────────────────
 * Single source of truth for everything about you. Edit here and it
 * updates across the hero, about, contact, footer and SEO surfaces.
 */

export const profile = {
  /** Drives the hero headline, loading screen, footer and SEO. */
  name: 'John Doe',
  /** Username used to build social URLs. */
  handle: 'johndoe',
  /** Short, personal one-liner shown under the hero name. */
  bio: 'Full-stack builder, powered by AI.',
  /** Rotated by the hero typewriter, in order. */
  titles: [
    'Software Engineering Student',
    'Full-Stack Developer',
    'Android App Developer',
    'Web Developer',
    'UI/UX Designer',
    'AI Design Creator',
    'Founder of PulseChat',
  ],
  tagline: 'Building immersive interfaces where design meets engineering.',
  location: 'Available worldwide · Remote',
  /** Floating glass panels in the About section. */
  about: [
    {
      icon: '◆',
      title: 'Software Engineering Student',
      text: 'Passionate Software Engineering student turning computer-science fundamentals into products people actually use.',
    },
    {
      icon: '◇',
      title: 'Full-Stack Developer',
      text: 'React and Next.js on the front end, Node/Express APIs and MongoDB or MySQL on the back — I build and connect both ends, not just the interface.',
    },
    {
      icon: '▲',
      title: 'Android Developer',
      text: 'Native Android apps in Kotlin, shipped to Google Play with offline-first architecture and clean Material design.',
    },
    {
      icon: '●',
      title: 'Experience Designer',
      text: 'I love creating beautiful user experiences — interaction, motion and clarity are part of the engineering, not decoration.',
    },
    {
      icon: '✦',
      title: 'AI & Modern Web',
      text: 'Deeply interested in AI tools, generative design workflows and where modern web technology is heading next.',
    },
    {
      icon: '⬢',
      title: 'Founder — PulseChat',
      text: 'Founded and ship PulseChat, an anonymous real-time chat platform running on Cloudflare at the edge.',
    },
    {
      icon: '◈',
      title: 'Problem-First Mindset',
      text: 'Focused on building products that solve real-world problems rather than demos that only look good.',
    },
    {
      icon: '↗',
      title: 'Always Learning',
      text: 'Always learning new technologies — currently deep in 3D on the web, React Three Fiber and shader work.',
    },
  ],
};

/**
 * ── CONTACT CHANNELS ──────────────────────────────────────────────────
 * Add or remove a channel and the contact command-center grid adapts.
 * `href` is what the button opens; `handle` is the label shown.
 *
 * Available icons: mail | github | linkedin | discord | telegram | whatsapp
 * (see ICONS in src/components/sections/Contact.jsx) — so adding one of those
 * back later is just a matter of re-adding its object here.
 */
export const contactChannels = [
  {
    id: 'email',
    label: 'Email',
    handle: 'john.doe@example.com',
    href: 'mailto:john.doe@example.com',
    color: '#00E5FF',
    icon: 'mail',
  },
  {
    id: 'github',
    label: 'GitHub',
    // Shown as a call to action rather than the raw handle — the
    // platform's already named above it, so printing the handle again
    // underneath was redundant.
    handle: 'View Profile',
    href: 'https://github.com/johndoe',
    color: '#FFFFFF',
    icon: 'github',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/johndoe',
    href: 'https://www.linkedin.com/in/johndoe',
    color: '#0A84FF',
    icon: 'linkedin',
  },
];

/** Animated counters in the statistics band. */
export const statistics = [
  { label: 'Projects Completed', value: 24, suffix: '+' },
  { label: 'Technologies Learned', value: 28, suffix: '+' },
  { label: 'Hours of Coding', value: 4200, suffix: '+' },
  { label: 'Years Learning', value: 4, suffix: '' },
  { label: 'Apps Developed', value: 6, suffix: '' },
];

/**
 * Splits `name` for the two-line hero headline: everything except the final
 * word on line one, the surname on line two. Keeps the hero in sync with
 * `profile.name` instead of hardcoding the split.
 */
export function nameLines(name = profile.name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}

/** Navigation — order here drives the navbar and the scroll spy. */
export const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'services', label: 'Services' },
  { id: 'timeline', label: 'Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
];
