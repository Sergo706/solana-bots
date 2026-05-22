import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ignoreBunPlugin } from './vite.main.config';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
        resolve: {
        alias: {
          '@solana-bots': path.resolve(__dirname, '../src'),
          '@': path.resolve(__dirname, 'src'),
        },
      },
        ssr: {
    noExternal: true
  },
      plugins: [ignoreBunPlugin],
  optimizeDeps: {
    exclude: ['bun:sqlite', 'drizzle-orm/bun-sqlite', 'drizzle-orm/bun-sqlite/migrator']
  },
  build: {
    outDir: 'dist-worker',
    ssr: true,
    target: 'node20',
    lib: {
      entry: 'src/electron/utils/worker.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'electron', 
        'better-sqlite3',
        'bun:sqlite',
        'drizzle-orm/bun-sqlite',
        'drizzle-orm/bun-sqlite/migrator',
      ],
      output: {
        entryFileNames: '[name].mjs',
        inlineDynamicImports: true,
      },
    },
  },
});

