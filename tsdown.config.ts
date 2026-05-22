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
   }
])