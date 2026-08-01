/**
 * ── JOURNEY TIMELINE ──────────────────────────────────────────────────
 * Rendered as an animated vertical spine. Entries reveal as they scroll
 * into view; the glowing progress line tracks scroll position.
 *
 * Append an entry and the spine, markers and stagger all recalculate.
 */
export const timeline = [
  {
    id: 'student',
    period: '2022 — Present',
    title: 'Software Engineering Student',
    tag: 'Foundation',
    color: '#00E5FF',
    description:
      'Started formal Software Engineering studies — data structures, algorithms, OOP and systems thinking. This is the base layer everything else is built on.',
    highlights: ['Data structures & algorithms', 'OOP and clean architecture', 'Databases & networking'],
  },
  {
    id: 'frontend',
    period: '2022 — 2023',
    title: 'Front-end Development',
    tag: 'Craft',
    color: '#38BDF8',
    description:
      'Went deep on the web platform: semantic HTML, modern CSS, then JavaScript and React. Learned that the difference between good and great is entirely in the details.',
    highlights: ['HTML, CSS, JavaScript', 'React component architecture', 'TailwindCSS design systems'],
  },
  {
    id: 'android',
    period: '2023 — 2024',
    title: 'Android Development',
    tag: 'Mobile',
    color: '#14F195',
    description:
      'Moved into native Android with Kotlin and XML — lifecycle, layouts, storage, background work and the discipline of shipping to real devices.',
    highlights: ['Kotlin & coroutines', 'Material layouts in XML', 'Firebase integration'],
  },
  {
    id: 'coursetech',
    period: '2024',
    title: 'CourseTech Project',
    tag: 'Milestone',
    color: '#14F195',
    description:
      'Designed and built a complete offline-first educational Android app: courses, notes, quizzes, text-to-speech and homework tracking. My first end-to-end product.',
    highlights: ['Offline-first architecture', 'Quiz & TTS engines', 'Full product ownership'],
  },
  {
    id: 'ai-design',
    period: '2024 — 2025',
    title: 'AI Design Journey',
    tag: 'Creative',
    color: '#7C3AED',
    description:
      'Started building generative design workflows — prompt systems, iteration loops and post-production — turning AI from a novelty into a repeatable production pipeline.',
    highlights: ['Prompt engineering', 'Generative visual pipelines', 'Photoshop & Figma finishing'],
  },
  {
    id: 'strangermeet',
    period: '2025',
    title: 'Founder of StrangerMeet.org',
    tag: 'Founder',
    color: '#00E5FF',
    description:
      'Founded StrangerMeet.org — an anonymous real-time chat platform. Owned the product end to end: concept, UI, real-time layer and edge deployment on Cloudflare.',
    highlights: ['Real-time WebSocket layer', 'Cloudflare edge delivery', 'Product & brand ownership'],
  },
  {
    id: 'web',
    period: '2025 — 2026',
    title: 'Web Development',
    tag: 'Scale',
    color: '#F472B6',
    description:
      'Broadened into full-stack: TypeScript, Next.js, Node, Express, MongoDB and REST API design — plus the deployment and performance work that surrounds them.',
    highlights: ['TypeScript & Next.js', 'Node, Express, MongoDB', 'API design & performance'],
  },
  {
    id: 'current',
    period: '2026 — Now',
    title: 'Current Projects',
    tag: 'Now',
    color: '#14F195',
    description:
      'Building immersive 3D web experiences with Three.js and React Three Fiber, an AI design store, and the next SaaS product. Always learning what is next.',
    highlights: ['Three.js & R3F', 'AI design store', 'SaaS in research'],
  },
];
