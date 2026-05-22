import { defineConfig } from 'vite'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ignoreBunPlugin = {
  name: 'ignore-bun-modules',
  resolveId(id: string) {
    if (id === 'bun:sqlite' || id.includes('bun-sqlite')) {
      return { id, external: true };
    }
  }
};
export default defineConfig({
    resolve: {
    alias: {
      '@solana-bots': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [ignoreBunPlugin],
  optimizeDeps: {
    exclude: ['bun:sqlite', 'drizzle-orm/bun-sqlite', 'drizzle-orm/bun-sqlite/migrator']
  },
          ssr: {
    noExternal: true
  },
  build: {
    ssr: true,
    target: 'node20',
    lib: {
      entry: 'src/electron/main.ts',
      formats: ['es'],
      fileName: 'main',
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
          format: 'cjs',
          entryFileNames: '[name].js',
          inlineDynamicImports: true,
        }
    },
  },
})