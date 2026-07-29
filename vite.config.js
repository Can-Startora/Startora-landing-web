import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? (process.env.VITE_BASE_URL || '/Startora-landing-web/') : '/',
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('gsap') || id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-animation';
              }
              if (id.includes('ogl') || id.includes('gl-matrix')) {
                return 'vendor-graphics';
              }
              return 'vendor-utils';
            }
          }
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})

