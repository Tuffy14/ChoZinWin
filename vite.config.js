import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ChoZinWin/',  // GitHub repo name
  build: {
    outDir: 'dist',  // Ensure build outputs to dist
  },
})
