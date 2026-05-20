// @ts-ignore
import path from 'node:path';
import { defineConfig, type UserConfig } from 'tsdown';
// @ts-ignore
const projectRoot = import.meta.dirname;

export default defineConfig([
   {
     target: ['node20', "esnext"],
     clean: true,
     sourcemap: true,
     dts: false,
     failOnWarn: true,
     deps: {
       neverBundle: ['bun:sqlite']
     },
     entry: {
        cli: 'src/main.ts'
     },
     format: ['esm'],
   },
    {
     entry: ['ui/src/electron/utils/worker.ts', 'ui/src/electron/utils/OperationWorker.ts'],
     outDir: 'ui/dist-worker',
     format: ['esm'],
     target: ['node20', "esnext"],
     clean: true,
     sourcemap: true,
     dts: false,
     external: ['*'],
     alias: {
      '@solana-bots': path.resolve(projectRoot, './src'),
      '@': path.resolve(projectRoot, './ui/src'),
    },
   },
   
])