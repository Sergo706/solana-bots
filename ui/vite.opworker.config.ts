import { defineConfig } from 'vite';
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
        ssr: {
    noExternal: true
  },
  build: {
    outDir: 'dist-worker/ops',
    ssr: true,
    target: 'node20',
    lib: {
      entry: 'src/electron/utils/OperationWorker.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'electron',
        'better-sqlite3'
      ],
      output: {
        entryFileNames: '[name].mjs',
        inlineDynamicImports: true,
      },
    },
  },
});

        