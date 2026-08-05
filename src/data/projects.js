/**
 * ── PROJECTS ──────────────────────────────────────────────────────────
 * Every entry becomes a floating holographic cube in the 3D projects
 * section, and expands into a fullscreen case study on click.
 *
 * TO ADD A PROJECT: copy any object below and append it. Cube positions,
 * colours and layout are all derived — nothing else needs to change.
 *
 *   id          unique slug (also used for the deep-link hash)
 *   status      'shipped' | 'live' | 'building' | 'planned'  → badge colour
 *   accent      hologram / glow colour for the cube
 *   images      paths under /public — replace placeholders with real shots
 *   stats       key/value pairs shown in the case study header
 *   links       live + repo; omit or set null to hide that button
 */

export const projects = [
  {
    id: 'strangermeet',
    title: 'StrangerMeet.org',
    subtitle: 'Anonymous random chat platform',
    year: '2025',
    status: 'live',
    accent: '#00E5FF',
    description:
      'A real-time anonymous chat platform I founded and ship. Strangers are paired instantly, with no account and no history kept. The whole front end is deployed on Cloudflare so matching feels immediate anywhere in the world, and the interface was designed mobile-first to stay fast on weak connections.',
    technologies: ['JavaScript', 'React', 'TailwindCSS', 'Node.js', 'WebSockets', 'Cloudflare'],
    features: [
      'Instant anonymous stranger pairing',
      'Real-time messaging over WebSockets',
      'Fully responsive, mobile-first interface',
      'Modern glass UI with dark theme',
      'Edge deployment on Cloudflare for low latency',
      'No accounts, no stored chat history',
    ],
    stats: [
      { label: 'Latency', value: '<100ms' },
      { label: 'Uptime', value: '99.9%' },
      { label: 'Role', value: 'Founder' },
    ],
    images: ['/projects/strangermeet-1.svg', '/projects/strangermeet-2.svg', '/projects/strangermeet-3.svg'],
    links: { live: 'https://strangermeet.org', repo: null },
  },
  {
    id: 'portfolio',
    title: 'Portfolio Website',
    subtitle: 'This interactive 3D experience',
    year: '2026',
    status: 'live',
    accent: '#7C3AED',
    description:
      'The site you are exploring right now. A cinematic WebGL portfolio built with React Three Fiber: a fully modelled 3D workspace, a navigable skills galaxy, holographic project cubes and GSAP-driven scroll choreography — all budgeted to hold 60 FPS and degrade gracefully to a lighter scene on mobile.',
    technologies: ['React', 'Vite', 'Three.js', 'React Three Fiber', 'Framer Motion', 'GSAP', 'TailwindCSS', 'Lenis'],
    features: [
      'Procedurally modelled 3D desk workspace',
      'Interactive skills galaxy with expandable nodes',
      'Holographic project cubes with camera zoom',
      'Lenis smooth scrolling with GSAP timelines',
      'Custom cursor, magnetic buttons, particle trails',
      'Adaptive quality tiers to protect frame rate',
    ],
    stats: [
      { label: 'Target FPS', value: '60' },
      { label: 'Sections', value: '11' },
      { label: 'Bundle', value: 'Split' },
    ],
    images: ['/projects/portfolio-1.svg', '/projects/portfolio-2.svg', '/projects/portfolio-3.svg'],
    links: { live: 'https://ajk.dev', repo: 'https://github.com/akifjaseemkhan' },
  },
  {
    // ⚠️ Description, features, stats and images below are still guesses —
    // the live link is real, replace the rest with real details once you
    // have them.
    id: 'aj-educators',
    title: 'AJ Educators',
    subtitle: 'Educational Android app',
    year: '2025',
    status: 'live',
    accent: '#14F195',
    description:
      'An Android app built to make learning more structured and accessible for students — course content, tracking and a clean, distraction-free interface.',
    technologies: ['Kotlin', 'XML', 'Android Studio', 'Firebase'],
    features: [
      'Structured course content',
      'Progress tracking',
      'Clean, student-focused interface',
    ],
    stats: [
      { label: 'Platform', value: 'Android' },
      { label: 'Status', value: 'Published' },
    ],
    images: ['/projects/aj-educators-1.svg', '/projects/aj-educators-2.svg'],
    links: { live: 'https://play.google.com/store/apps/dev?id=7158928373588415830&hl=en', repo: null },
  },
  {
    // ⚠️ Description, features, stats and images below are still guesses —
    // the live link is real, replace the rest with real details once you
    // have them.
    id: 'bitread',
    title: 'Bitread',
    subtitle: 'Reading companion Android app',
    year: '2025',
    status: 'live',
    accent: '#7C3AED',
    description:
      'An Android app for readers — built around a fast, focused reading experience with a modern interface.',
    technologies: ['Kotlin', 'XML', 'Android Studio', 'Firebase'],
    features: [
      'Fast, focused reading experience',
      'Modern Material interface',
      'Built for everyday use',
    ],
    stats: [
      { label: 'Platform', value: 'Android' },
      { label: 'Status', value: 'Published' },
    ],
    images: ['/projects/bitread-1.svg', '/projects/bitread-2.svg'],
    links: { live: 'https://play.google.com/store/apps/details?id=com.bitreadapp&hl=en', repo: null },
  },
  {
    id: 'playstore-apps',
    title: 'Play Store Apps',
    subtitle: 'Published Android apps',
    year: '2025',
    status: 'live',
    accent: '#00E5FF',
    description:
      'A collection of Android apps published on the Google Play Store, covering education, utilities and everyday tools.',
    technologies: ['Kotlin', 'XML', 'Android Studio', 'Firebase', 'Google Play Publishing'],
    features: [
      'Published and maintained on Google Play',
      'Store listing, signing and staged rollouts',
      'Real users, real feedback loops',
    ],
    stats: [
      { label: 'Platform', value: 'Android' },
      { label: 'Store', value: 'Google Play' },
    ],
    images: ['/projects/playstore-apps-1.svg', '/projects/playstore-apps-2.svg'],
    links: {
      live: 'https://play.google.com/store/apps/details?id=motivationalvalley.ChangeYourThinkingChangeYourLife&hl=en',
      repo: null,
    },
  },
  {
    // Live and in day-to-day use — it's a private/internal tool, so there's
    // no public URL to link to. `statusNote` is read by the status popup
    // in Projects.jsx instead of the generic "not published yet" copy,
    // which would be misleading for something that actually ships and runs.
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    subtitle: 'Full-stack analytics & management panel',
    year: '2025',
    status: 'live',
    statusNote: "Live and in active use — it's a private, internal tool, so there's no public link to share.",
    accent: '#00E5FF',
    description:
      'An internal dashboard for managing users and data: role-gated authentication, CRUD data tables and chart-based analytics views, running on a MySQL backend built for relational reporting queries.',
    technologies: ['React', 'Node.js', 'Express', 'MySQL', 'REST APIs', 'TailwindCSS'],
    features: [
      'Role-based authentication',
      'CRUD data tables',
      'Chart-based analytics views',
      'Relational schema designed for reporting',
    ],
    stats: [
      { label: 'Stack', value: 'Node + MySQL' },
      { label: 'Status', value: 'Live (private)' },
    ],
    images: ['/projects/admin-dashboard-1.svg', '/projects/admin-dashboard-2.svg'],
    links: { live: null, repo: null },
  },
  {
    id: 'coursetech',
    title: 'CourseTech Android App',
    subtitle: 'Interactive educational Android application',
    year: '2024',
    status: 'shipped',
    accent: '#14F195',
    description:
      'A full offline-first learning platform for Android. CourseTech packages complete courses, notes, quizzes and homework tracking into a single app that keeps working with no connection — built for students who cannot rely on stable internet. Text-to-speech turns any lesson into audio, and progress syncs the moment the device comes back online.',
    technologies: ['Kotlin', 'XML', 'JavaScript', 'HTML', 'Firebase', 'Android Studio'],
    features: [
      'Offline course library with downloadable lessons',
      'Rich note-taking bound to each lesson',
      'Quiz engine with instant scoring and review',
      'Text-to-speech playback for every lesson',
      'Homework tracker with deadline reminders',
      'Visual progress tracking across all courses',
    ],
    stats: [
      { label: 'Courses', value: '30+' },
      { label: 'Offline', value: '100%' },
      { label: 'Platform', value: 'Android' },
    ],
    images: ['/projects/coursetech-1.svg', '/projects/coursetech-2.svg', '/projects/coursetech-3.svg'],
    links: { live: null, repo: 'https://github.com/akifjaseemkhan' },
  },
  {
    // ⚠️ Placeholder entry — represents full-stack web work that exists but
    // was never deployed publicly, so there's no real screenshot to use.
    // `images` point at generated mockup art (see scripts/generate-placeholders.mjs)
    // rather than a real capture — swap them for actual screenshots once
    // any of these go live, and adjust description/features/stats to match
    // the real build.
    id: 'ecommerce-store',
    title: 'E-Commerce Store',
    subtitle: 'Full-stack online storefront',
    year: '2025',
    status: 'shipped',
    accent: '#F472B6',
    description:
      'A complete MERN-stack storefront: product catalogue, cart, checkout flow and an admin panel for managing inventory — built to prove out a full order pipeline end to end, from browsing to a completed order.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'TailwindCSS'],
    features: [
      'Product catalogue with search and filters',
      'Cart and multi-step checkout flow',
      'Admin panel for inventory management',
      'REST API backend with MongoDB persistence',
    ],
    stats: [
      { label: 'Stack', value: 'MERN' },
      { label: 'Type', value: 'E-Commerce' },
    ],
    images: ['/projects/ecommerce-store-1.svg', '/projects/ecommerce-store-2.svg'],
    links: { live: null, repo: null },
  },
  {
    // ⚠️ Placeholder entry — see note on ecommerce-store above.
    id: 'restaurant-website',
    title: 'Restaurant Booking Site',
    subtitle: 'Business website with table reservations',
    year: '2025',
    status: 'shipped',
    accent: '#FBBF24',
    description:
      'A full-stack business website for a restaurant: a digital menu, a table reservation system backed by a relational database, and a contact/enquiry form — the kind of site a local business actually needs to run.',
    technologies: ['React', 'Node.js', 'Express', 'MySQL', 'REST APIs'],
    features: [
      'Digital menu organised by category',
      'Table reservation system with live availability',
      'MySQL-backed booking records',
      'Responsive, mobile-first design',
    ],
    stats: [
      { label: 'Stack', value: 'Node + MySQL' },
      { label: 'Type', value: 'Business Site' },
    ],
    images: ['/projects/restaurant-website-1.svg', '/projects/restaurant-website-2.svg'],
    links: { live: null, repo: null },
  },
  {
    id: 'ai-design-store',
    title: 'AI Design Store',
    subtitle: 'Generative design marketplace',
    year: '2026',
    status: 'building',
    accent: '#7C3AED',
    description:
      'An upcoming storefront for AI-assisted design products — templates, poster sets, UI kits and brand packs produced through a repeatable generative pipeline. The focus is on curation and consistency: every asset passes through the same prompt system, review pass and export spec.',
    technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'Stripe', 'AI Design', 'Prompt Engineering'],
    features: [
      'Curated generative design catalogue',
      'Instant digital delivery after checkout',
      'Repeatable prompt-driven production pipeline',
      'License management per product tier',
    ],
    stats: [
      { label: 'Stage', value: 'In build' },
      { label: 'Model', value: 'Digital' },
    ],
    images: ['/projects/ai-design-store-1.svg', '/projects/ai-design-store-2.svg'],
    links: { live: null, repo: null },
  },
  {
    id: 'etsy-digital',
    title: 'Etsy Digital Products',
    subtitle: 'AI-crafted digital product line',
    year: '2026',
    status: 'building',
    accent: '#14F195',
    description:
      'A digital product line sold through Etsy: printable art sets, planner systems and social templates, each produced with an AI-first workflow and finished by hand in Photoshop and Figma. It is as much a study in listing design, SEO and conversion as it is in visual output.',
    technologies: ['AI Design', 'Photoshop', 'Figma', 'Prompt Engineering'],
    features: [
      'Print-ready art and template collections',
      'Listing SEO and mockup presentation system',
      'Batch production workflow for consistent output',
    ],
    stats: [
      { label: 'Channel', value: 'Etsy' },
      { label: 'Type', value: 'Digital' },
    ],
    images: ['/projects/etsy-digital-1.svg', '/projects/etsy-digital-2.svg'],
    links: { live: null, repo: null },
  },
  {
    id: 'saas',
    title: 'SaaS Platform',
    subtitle: 'Future product experiment',
    year: '2026+',
    status: 'planned',
    accent: '#00E5FF',
    description:
      'The next step: a subscription product combining everything above — a React front end, a Node service layer, Firebase or Mongo persistence, and AI features that do real work rather than decorate the UI. Currently in problem-discovery, deliberately unscoped until the problem is worth solving.',
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs', 'Cloudflare'],
    features: [
      'Multi-tenant dashboard architecture',
      'Subscription billing and usage metering',
      'AI-assisted workflows built into the core loop',
    ],
    stats: [
      { label: 'Stage', value: 'Research' },
      { label: 'Target', value: '2026+' },
    ],
    images: ['/projects/saas-1.svg', '/projects/saas-2.svg'],
    links: { live: null, repo: null },
  },
];

/** Badge palette for `status`. */
export const STATUS_STYLES = {
  shipped: { label: 'Shipped', color: '#14F195' },
  live: { label: 'Live', color: '#00E5FF' },
  building: { label: 'In Build', color: '#FBBF24' },
  planned: { label: 'Planned', color: '#7C3AED' },
};

/**
 * Fans the cubes out on a dramatic arc, each one rotated to face back
 * toward the array's focal centre — the "carousel of screens curving away
 * from a central point" composition, rather than a flat row. Cards near
 * the centre sit closest to the camera and face it almost directly; cards
 * toward the edges swing outward and recede in depth.
 */
export function layoutCubes(list = projects, radius = 8.5, angleSpreadDeg = 132) {
  const n = list.length;
  const angleSpread = (angleSpreadDeg * Math.PI) / 180;

  return list.map((project, i) => {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5 → 0.5
    const angle = t * angleSpread;

    return {
      ...project,
      position: [
        Math.sin(angle) * radius,
        Math.sin(Math.abs(t) * Math.PI) * 0.35,
        // 0 at the centre card, increasingly negative (further from camera)
        // toward the edges — the arc bulges toward the viewer in the middle.
        -radius * (1 - Math.cos(angle)),
      ],
      // Damped rather than a full 1:1 turn, so edge cards angle away
      // without turning fully edge-on and disappearing.
      rotationY: -angle * 0.8,
      phase: i * 0.7,
    };
  });
}
