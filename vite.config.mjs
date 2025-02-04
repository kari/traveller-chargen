import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src', 'index.html'),
        about: resolve(__dirname, 'src', 'about.html'),
        worldgen: resolve(__dirname, 'src', 'worldgen.html'),
      },
    },
  },
})
