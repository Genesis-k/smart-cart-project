import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API requests to backend
      // Using 127.0.0.1 instead of localhost to avoid IPv6 connection issues
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      // Forward Image requests to backend
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})