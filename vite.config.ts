import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/patients': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/encounters': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/appointments': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/departments': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/prescriptions': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/patient-workflow': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ai-assessment': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})