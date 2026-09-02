import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 Vite plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      // Proxy fanart.tv API calls to bypass CORS
      '/fanart-api': {
        target: 'https://webservice.fanart.tv/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fanart-api/, ''),
      },
      // Proxy local API calls to Django dev server 
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Local dev proxies for AI testing (bypass CORS)
      '/api/hf-inference': {
        target: 'https://router.huggingface.co/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hf-inference/, ''),
      },
      '/api/groq-inference': {
        target: 'https://api.groq.com/openai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq-inference/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-utils': ['@tanstack/react-query', 'lucide-react'],
        },
      },
    },
  },
})
