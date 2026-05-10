import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
   {
     target: ['node20', "esnext"],
     clean: true,
     sourcemap: true,
     dts: false,
     failOnWarn: true,
     entry: {
        cli: 'src/main.ts'
     },
     format: ['esm'],
   }
])