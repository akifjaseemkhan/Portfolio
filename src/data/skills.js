/**
 * ── SKILLS GALAXY ─────────────────────────────────────────────────────
 * Each skill becomes a glowing sphere floating in 3D space.
 *
 * To add a skill: append an object here. Positions are generated
 * automatically (see `buildGalaxy` below) so you never place spheres by hand.
 *
 *   name     display label
 *   level    0–100, drives sphere radius and the detail panel meter
 *   color    glow colour of the sphere
 *   glyph    short mark drawn on the sphere as its icon (1–2 chars reads best)
 *   category groups spheres into orbital shells + filter pills
 *   blurb    shown when the sphere is expanded
 */

export const CATEGORIES = {
  frontend: { label: 'Frontend', color: '#00E5FF' },
  mobile: { label: 'Android', color: '#14F195' },
  backend: { label: 'Backend', color: '#7C3AED' },
  design: { label: 'Design & AI', color: '#F472B6' },
  tools: { label: 'Tools & Ops', color: '#FBBF24' },
};

export const skills = [
  // ── Frontend ──────────────────────────────────────────────────────
  { name: 'HTML', level: 95, glyph: '</>', category: 'frontend', color: '#E34F26', blurb: 'Semantic, accessible markup as the foundation of every build.' },
  { name: 'CSS', level: 93, glyph: '#', category: 'frontend', color: '#2965F1', blurb: 'Modern layout, custom properties, container queries and fluid type.' },
  { name: 'JavaScript', level: 92, glyph: 'JS', category: 'frontend', color: '#F7DF1E', blurb: 'ES2023+, async patterns, and the language behind everything I ship.' },
  { name: 'TypeScript', level: 84, glyph: 'TS', category: 'frontend', color: '#3178C6', blurb: 'Typed contracts across components, APIs and state.' },
  { name: 'React', level: 92, glyph: '⚛', category: 'frontend', color: '#61DAFB', blurb: 'Hooks, composition, suspense and performance-minded rendering.' },
  { name: 'Next.js', level: 82, glyph: 'N', category: 'frontend', color: '#FFFFFF', blurb: 'App router, server components, edge rendering and SEO-first pages.' },
  { name: 'TailwindCSS', level: 94, glyph: '~', category: 'frontend', color: '#38BDF8', blurb: 'Design-token driven styling that scales without CSS debt.' },
  { name: 'Three.js', level: 80, glyph: '△', category: 'frontend', color: '#00E5FF', blurb: 'Scenes, materials, lighting and custom shader work on the web.' },
  { name: 'React Three Fiber', level: 78, glyph: '◎', category: 'frontend', color: '#7C3AED', blurb: 'Declarative 3D — the engine behind this very portfolio.' },
  { name: 'Framer Motion', level: 88, glyph: 'F', category: 'frontend', color: '#F472B6', blurb: 'Layout animation, gestures and orchestrated page transitions.' },
  { name: 'Responsive Design', level: 95, glyph: '▭', category: 'frontend', color: '#14F195', blurb: 'One codebase that feels native from 320px to ultrawide.' },

  // ── Android ───────────────────────────────────────────────────────
  { name: 'Android Studio', level: 86, glyph: '▲', category: 'mobile', color: '#3DDC84', blurb: 'Full native workflow: profiling, Gradle, emulators, release builds.' },
  { name: 'Kotlin', level: 85, glyph: 'K', category: 'mobile', color: '#A97BFF', blurb: 'Coroutines, flows and idiomatic Kotlin for production Android apps.' },
  { name: 'XML', level: 88, glyph: '<>', category: 'mobile', color: '#FF6F00', blurb: 'Layouts, constraint hierarchies, themes and adaptive resources.' },
  { name: 'Google Play Publishing', level: 80, glyph: '▷', category: 'mobile', color: '#14F195', blurb: 'Store listings, signing, staged rollouts and policy compliance.' },
  { name: 'Ad Monetization', level: 76, glyph: '$', category: 'mobile', color: '#FBBF24', blurb: 'AdMob integration balanced against real user experience.' },

  // ── Backend ───────────────────────────────────────────────────────
  { name: 'Node.js', level: 80, glyph: '⬢', category: 'backend', color: '#68A063', blurb: 'Services, tooling and real-time servers on the JS runtime.' },
  { name: 'Express', level: 78, glyph: 'ex', category: 'backend', color: '#FFFFFF', blurb: 'Routing, middleware and pragmatic REST layers.' },
  { name: 'MongoDB', level: 75, glyph: '🍃', category: 'backend', color: '#4DB33D', blurb: 'Schema design, aggregation pipelines and indexing for speed.' },
  { name: 'MySQL', level: 78, glyph: 'SQL', category: 'backend', color: '#4479A1', blurb: 'Relational schema design, joins and query optimization for structured data.' },
  { name: 'Firebase', level: 84, glyph: '🔥', category: 'backend', color: '#FFCA28', blurb: 'Auth, Firestore, storage and cloud messaging in shipped apps.' },
  { name: 'REST APIs', level: 86, glyph: '{}', category: 'backend', color: '#00E5FF', blurb: 'Designing and consuming clean, versioned, well-documented APIs.' },
  { name: 'Cloudflare', level: 79, glyph: '☁', category: 'backend', color: '#F38020', blurb: 'Pages, Workers and edge delivery — powering StrangerMeet.org.' },

  // ── Design & AI ───────────────────────────────────────────────────
  { name: 'Figma', level: 88, glyph: '◐', category: 'design', color: '#F24E1E', blurb: 'Design systems, auto-layout, prototyping and dev handoff.' },
  { name: 'Photoshop', level: 82, glyph: 'Ps', category: 'design', color: '#31A8FF', blurb: 'Compositing, retouching and asset production for web and store art.' },
  { name: 'AI Design', level: 90, glyph: '✦', category: 'design', color: '#7C3AED', blurb: 'Generative visual workflows for products, branding and digital goods.' },
  { name: 'Prompt Engineering', level: 89, glyph: '⌘', category: 'design', color: '#14F195', blurb: 'Structured prompting and evaluation to get reliable model output.' },
  { name: 'ChatGPT', level: 93, glyph: 'GPT', category: 'design', color: '#74AA9C', blurb: 'Daily driver for drafting, debugging and thinking through problems out loud.' },
  { name: 'Claude', level: 95, glyph: 'C', category: 'design', color: '#D97757', blurb: 'The model behind most of my serious build work — including this site.' },
  { name: 'Gemini', level: 85, glyph: 'G', category: 'design', color: '#4285F4', blurb: 'Google’s model for research, long-context tasks and Workspace integration.' },
  { name: 'Midjourney', level: 82, glyph: '✧', category: 'design', color: '#B983FF', blurb: 'Generative imagery for branding, posters and digital product art.' },

  // ── Tools ─────────────────────────────────────────────────────────
  { name: 'Git', level: 90, glyph: '⑂', category: 'tools', color: '#F05032', blurb: 'Branching strategy, rebases, bisect and a clean commit history.' },
  { name: 'GitHub', level: 90, glyph: '◉', category: 'tools', color: '#FFFFFF', blurb: 'Actions, PR review culture, issues and releases.' },
];

/**
 * Distributes skills over concentric orbital shells using a Fibonacci
 * sphere, so the galaxy stays evenly spread no matter how many you add.
 */
export function buildGalaxy(list = skills, radius = 6.2) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = list.length;

  return list.map((skill, i) => {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2; // 1 → -1
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // Alternate shells so spheres don't all sit on one hollow surface.
    const shell = radius * (0.72 + 0.28 * ((i % 3) / 2));

    return {
      ...skill,
      id: skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      position: [Math.cos(theta) * ring * shell, y * shell * 0.62, Math.sin(theta) * ring * shell],
      /** Sphere size scales gently with proficiency. */
      size: 0.26 + (skill.level / 100) * 0.26,
      /** Desynchronises the float/pulse animation per sphere. */
      phase: (i / n) * Math.PI * 2,
    };
  });
}
