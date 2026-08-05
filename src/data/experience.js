/**
 * ── EXPERIENCE ROOM ───────────────────────────────────────────────────
 * Each entry is a hologram in the room. Selecting one re-themes the
 * room lighting, particles and the surrounding data readouts.
 */
export const experienceRooms = [
  {
    id: 'frontend',
    label: 'Frontend',
    color: '#00E5FF',
    headline: 'Interfaces that feel alive',
    summary:
      "Component architecture, motion design and performance budgets — backed by the Node, MongoDB and MySQL services I build to go with them. I don't just wire up an interface; I build front ends that stay fast under real conditions and still feel crafted.",
    stack: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
    metrics: [
      { label: 'Lighthouse', value: '95+' },
      { label: 'Components built', value: '200+' },
      { label: 'Frame budget', value: '16ms' },
    ],
    /** Drives the hologram's generated geometry — see ExperienceRoom.jsx */
    shape: 'grid',
  },
  {
    id: 'android',
    label: 'Android',
    color: '#14F195',
    headline: 'Native apps that work offline',
    summary:
      'Kotlin and XML, offline-first storage, background sync and Play Store releases. Built for devices and networks that are not ideal.',
    stack: ['Kotlin', 'XML', 'Android Studio', 'Firebase', 'Play Console'],
    metrics: [
      { label: 'Apps shipped', value: '6' },
      { label: 'Offline support', value: '100%' },
      { label: 'Min SDK', value: '24' },
    ],
    shape: 'device',
  },
  {
    id: 'design',
    label: 'UI Design',
    color: '#F472B6',
    headline: 'Systems, not screens',
    summary:
      'Design tokens, type scales, spacing systems and prototypes in Figma — so an interface stays coherent as it grows past the first ten screens.',
    stack: ['Figma', 'Photoshop', 'Design Systems', 'Prototyping'],
    metrics: [
      { label: 'Design systems', value: '5' },
      { label: 'Prototypes', value: '40+' },
      { label: 'Handoff', value: 'Dev-ready' },
    ],
    shape: 'orbit',
  },
  {
    id: 'ai',
    label: 'AI',
    color: '#7C3AED',
    headline: 'Generative workflows that ship',
    summary:
      'Prompt engineering and generative pipelines applied to real product output — design assets, copy systems and AI features inside applications.',
    stack: ['Prompt Engineering', 'AI Design', 'Generative Pipelines'],
    metrics: [
      { label: 'Assets produced', value: '500+' },
      { label: 'Pipelines', value: '4' },
      { label: 'Iteration', value: 'Fast' },
    ],
    shape: 'neural',
  },
  {
    id: 'webapps',
    label: 'Web Apps',
    color: '#FBBF24',
    headline: 'Full-stack, edge-deployed',
    summary:
      'Node and Express services, MongoDB and Firebase persistence, REST APIs, and Cloudflare delivery — the layer that makes a front end into a product.',
    stack: ['Node.js', 'Express', 'MongoDB', 'MySQL', 'REST APIs', 'Cloudflare'],
    metrics: [
      { label: 'APIs built', value: '20+' },
      { label: 'Edge deploys', value: 'Cloudflare' },
      { label: 'Uptime', value: '99.9%' },
    ],
    shape: 'network',
  },
];

/**
 * ── CERTIFICATES ──────────────────────────────────────────────────────
 * Floating holographic cards. Set `url` to link to a credential.
 */
export const certificates = [
  {
    // ⚠️ Year is a guess — replace with the real completion date.
    id: 'cert-aptech-frontend',
    title: 'Front End Development',
    issuer: 'Aptech',
    year: '2022',
    color: '#FF5A36',
    skills: ['HTML', 'CSS', 'JavaScript'],
    url: null,
  },
  {
    id: 'cert-web',
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    year: '2023',
    color: '#00E5FF',
    skills: ['HTML', 'CSS', 'Accessibility'],
    url: null,
  },
  {
    id: 'cert-js',
    title: 'JavaScript Algorithms & Data Structures',
    issuer: 'freeCodeCamp',
    year: '2023',
    color: '#F7DF1E',
    skills: ['JavaScript', 'Algorithms'],
    url: null,
  },
  {
    id: 'cert-android',
    title: 'Android Development with Kotlin',
    issuer: 'Google Developers',
    year: '2024',
    color: '#14F195',
    skills: ['Kotlin', 'Android', 'Material Design'],
    url: null,
  },
  {
    id: 'cert-react',
    title: 'Advanced React',
    issuer: 'Meta',
    year: '2024',
    color: '#61DAFB',
    skills: ['React', 'Hooks', 'Performance'],
    url: null,
  },
  {
    id: 'cert-uiux',
    title: 'UI/UX Design Foundations',
    issuer: 'Google',
    year: '2024',
    color: '#F472B6',
    skills: ['Figma', 'Design Systems', 'Research'],
    url: null,
  },
  {
    id: 'cert-ai',
    title: 'Prompt Engineering & Generative AI',
    issuer: 'Independent Study',
    year: '2025',
    color: '#7C3AED',
    skills: ['Prompt Engineering', 'AI Design'],
    url: null,
  },
];

/**
 * ── TECH STACK WALL ───────────────────────────────────────────────────
 * Icons are drawn from short inline glyphs so the wall ships with zero
 * image requests. `glyph` renders inside the tile, `color` is the glow.
 */
export const techWall = [
  { name: 'HTML', glyph: '</>', color: '#E34F26' },
  { name: 'CSS', glyph: '#', color: '#2965F1' },
  { name: 'JavaScript', glyph: 'JS', color: '#F7DF1E' },
  { name: 'TypeScript', glyph: 'TS', color: '#3178C6' },
  { name: 'React', glyph: '⚛', color: '#61DAFB' },
  { name: 'Next.js', glyph: 'N', color: '#FFFFFF' },
  { name: 'Tailwind', glyph: '~', color: '#38BDF8' },
  { name: 'Three.js', glyph: '△', color: '#00E5FF' },
  { name: 'R3F', glyph: '◎', color: '#7C3AED' },
  { name: 'Framer', glyph: 'F', color: '#F472B6' },
  { name: 'Kotlin', glyph: 'K', color: '#A97BFF' },
  { name: 'Android', glyph: '🤖', color: '#3DDC84' },
  { name: 'XML', glyph: '<>', color: '#FF6F00' },
  { name: 'Firebase', glyph: '▲', color: '#FFCA28' },
  { name: 'Node.js', glyph: '⬢', color: '#68A063' },
  { name: 'Express', glyph: 'ex', color: '#FFFFFF' },
  { name: 'MongoDB', glyph: '🍃', color: '#4DB33D' },
  { name: 'REST', glyph: '{}', color: '#00E5FF' },
  { name: 'Git', glyph: '⑂', color: '#F05032' },
  { name: 'GitHub', glyph: '◉', color: '#FFFFFF' },
  { name: 'Cloudflare', glyph: '☁', color: '#F38020' },
  { name: 'Figma', glyph: '◐', color: '#F24E1E' },
  { name: 'Photoshop', glyph: 'Ps', color: '#31A8FF' },
  { name: 'AI Design', glyph: '✦', color: '#7C3AED' },
  { name: 'Prompting', glyph: '⌘', color: '#14F195' },
  { name: 'Play Store', glyph: '▷', color: '#14F195' },
];
