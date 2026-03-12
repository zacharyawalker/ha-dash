import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    proxy: {
      '/api/ws': {
        target: 'http://localhost:8099',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:8099',
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
