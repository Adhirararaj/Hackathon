import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this if your backend runs on a different port
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})



