// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ChoZinWin/',   // 👈 IMPORTANT
  build: {
    outDir: 'dist',      // build goes to /dist
  },
})
