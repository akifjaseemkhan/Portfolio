/**
 * ── SERVICES ──────────────────────────────────────────────────────────
 * What you're available to be hired for. Rendered as a grid of glass
 * service modules with a "Request This Service" CTA that jumps to Contact
 * and pre-fills the message field.
 *
 * TO ADD A SERVICE: append an object below — layout, colours and the
 * contact hand-off are all derived from this list.
 *
 *   id           unique slug
 *   icon         short glyph shown in the module's badge
 *   color        accent colour for this module
 *   title        service name
 *   tagline      one-line hook shown under the title
 *   description  2-3 sentence explanation of what this covers
 *   deliverables what the client actually walks away with
 *   startingAt   set a string (e.g. "$300") to show a price badge, or
 *                leave null to show "Custom Quote" instead
 */
export const services = [
  {
    id: 'frontend',
    icon: '</>',
    color: '#00E5FF',
    title: 'Frontend Web Development',
    tagline: 'Fast, accessible interfaces that feel custom-built.',
    description:
      'React and Next.js sites built from a design or from scratch — landing pages, dashboards, marketing sites and web apps, with motion and interaction treated as part of the engineering, not an afterthought.',
    deliverables: [
      'Responsive, production-ready front end',
      'Component-based, maintainable codebase',
      'Performance and accessibility passes',
    ],
    startingAt: null,
  },
  {
    id: 'android',
    icon: '▲',
    color: '#14F195',
    title: 'Android App Development',
    tagline: 'Native apps, built to actually ship.',
    description:
      'Kotlin apps built for real devices and real networks — offline-first where it matters, clean Material design, and a straight path through signing and staged rollout to the Play Store.',
    deliverables: [
      'Native Kotlin app, offline-capable where needed',
      'Play Store listing and release management',
      'Firebase auth, storage and analytics setup',
    ],
    startingAt: null,
  },
  {
    id: 'uiux',
    icon: '◐',
    color: '#F472B6',
    title: 'UI/UX Design',
    tagline: 'Design systems, not just screens.',
    description:
      'Figma design systems, prototypes and full product flows built to stay coherent as a product grows past the first ten screens — with dev-ready handoff so nothing gets lost in translation.',
    deliverables: [
      'Figma design system and component library',
      'Interactive prototype for user testing',
      'Developer-ready handoff and spec',
    ],
    startingAt: null,
  },
  {
    id: 'ai',
    icon: '✦',
    color: '#7C3AED',
    title: 'AI-Powered Design & Automation',
    tagline: 'Generative workflows that produce real output.',
    description:
      'Prompt engineering and generative pipelines applied to actual deliverables — AI-assisted design production, content workflows, and AI features built into your product rather than bolted on.',
    deliverables: [
      'Custom prompt system for your use case',
      'AI feature integration inside your product',
      'Repeatable generative production pipeline',
    ],
    startingAt: null,
  },
  {
    id: 'fullstack',
    icon: '⬢',
    color: '#FBBF24',
    title: 'Full-Stack Web Apps',
    tagline: 'The backend that makes the front end real.',
    description:
      'Node and Express services, MongoDB, MySQL or Firebase persistence, REST APIs and edge deployment on Cloudflare — the layer that turns a front end into a working product with real data.',
    deliverables: [
      'REST API design and implementation',
      'Database schema and persistence layer',
      'Deployment and edge delivery setup',
    ],
    startingAt: null,
  },
  {
    id: '3d-experience',
    icon: '◎',
    color: '#00E5FF',
    title: '3D & Interactive Experiences',
    tagline: 'Portfolios and sites that feel like a demo, not a page.',
    description:
      "React Three Fiber builds in the exact style of the site you're on right now — cinematic 3D scenes, scroll choreography and interaction design for brands and portfolios that want to be memorable, not just functional.",
    deliverables: [
      'Custom 3D scene built for your brand',
      'Scroll-driven animation and interaction',
      'Performance-budgeted across devices',
    ],
    startingAt: null,
  },
];
