import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// GitHub Pages serves a project site from https://<user>.github.io/<repo>/,
// so every asset URL needs that sub-path prefix. Override with BASE_PATH=/
// when moving to a custom domain or a <user>.github.io repo.
const base = process.env.BASE_PATH ?? '/LajolieClinic/'

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    // Inline anything under 8 KB so the site loads in one round trip.
    assetsInlineLimit: 8192,
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
})
