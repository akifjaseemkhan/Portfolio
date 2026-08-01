import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    rollupOptions: {
      output: {
        // Split the heavy 3D stack out of the main bundle so the loading screen
        // and above-the-fold shell can paint before three.js is parsed.
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  // Respects PORT so the harness can assign a free port when 5173 is taken
  // by another session; falls back to 5173 for a plain `npm run dev`.
  server: { port: Number(process.env.PORT) || 5173, strictPort: false, open: false },
});
