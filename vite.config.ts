import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative base so it works on any path (root, GitHub Pages subpath, file://).
export default defineConfig({
  base: './',
  plugins: [react()],
})
