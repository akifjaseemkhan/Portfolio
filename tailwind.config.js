/**
 * Tailwind theme.
 * ── Change the whole site palette from `colors` below; every component reads
 *    from these tokens (or the matching CSS variables in src/index.css).
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#050816',
        surface: '#0A0F2C',
        primary: '#00E5FF',
        secondary: '#7C3AED',
        accent: '#14F195',
        glass: 'rgba(255,255,255,0.05)',
      },
      // 400ms is the house transition speed for hover states; it is not in
      // Tailwind's default scale, so `duration-400` needs registering here.
      transitionDuration: {
        400: '400ms',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0,229,255,0.35), 0 0 60px rgba(0,229,255,0.12)',
        'neon-violet': '0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)',
        'neon-green': '0 0 20px rgba(20,241,149,0.35), 0 0 60px rgba(20,241,149,0.12)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 20px 60px -20px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(ellipse at center, rgba(5,8,22,0) 0%, #050816 75%)',
        aurora:
          'conic-gradient(from 180deg at 50% 50%, #00E5FF 0deg, #7C3AED 120deg, #14F195 240deg, #00E5FF 360deg)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        scan: 'scan 4s linear infinite',
      },
    },
  },
  plugins: [],
};
