import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    out: './src/db/migrations',
    schema: './src/db/index.ts',
    dialect: 'sqlite',
    strict: true,
    dbCredentials: {
         url: "wallets.db",
    },
    verbose: true,
    casing: 'snake_case'
});
