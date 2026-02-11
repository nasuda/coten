import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/coten/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tcg: resolve(__dirname, 'tcg.html'),
      },
    },
  },
})
