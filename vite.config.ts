import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/ai': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/collaboration': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/deployment': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/pipeline': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})


