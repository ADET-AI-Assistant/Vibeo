import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 Vite plugin
  ],
  server: {
    proxy: {
      // Proxy fanart.tv API calls to bypass CORS
      // Frontend calls /fanart-api/... → forwarded to webservice.fanart.tv/v3/...
      '/fanart-api': {
        target: 'https://webservice.fanart.tv/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fanart-api/, ''),
      },
    },
  },
})
