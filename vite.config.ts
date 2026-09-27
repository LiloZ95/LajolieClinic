import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// The site is served from the root of its custom domain, https://lajolieclinic.se/.
// Override with BASE_PATH=/LajolieClinic/ to serve it from the GitHub Pages
// project sub-path (https://<user>.github.io/<repo>/) instead.
const base = process.env.BASE_PATH ?? "/"

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    // Inline anything under 8 KB so the site loads in one round trip.
    assetsInlineLimit: 8192,
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8443"),
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8443"),
  },
})
