import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid CORS when fetching NBA data from localhost
      '/nba-api': {
        target: 'https://cdn.nba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nba-api/, ''),
      },
    },
  },
})
