import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@rollup/plugin-yaml'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), yaml()],
  base: '/timeline/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
