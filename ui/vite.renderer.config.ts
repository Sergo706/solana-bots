import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), ui()],
  publicDir: 'assets/public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '#build/ui': path.resolve(__dirname, 'node_modules/.nuxt-ui/ui')
    },
  },
})