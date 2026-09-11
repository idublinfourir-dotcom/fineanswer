import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB (default is 500 kB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split only a few very large libraries into dedicated chunks.
          // Let Vite handle the rest to avoid circular dependencies between chunks.
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('gsap') || id.includes('lottie')) {
              return 'animation-vendor';
            }
          }
        },
      },
    },
  },
})
