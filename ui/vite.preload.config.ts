import { defineConfig } from 'vite'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
    alias: {
      '@solana-bots': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: 'src/electron/preload.ts',
      formats: ['cjs'],
      fileName: 'main',
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
})