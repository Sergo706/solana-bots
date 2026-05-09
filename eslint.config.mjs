import { defineStrictTSConfig } from "@riavzon/utils/eslint/strict"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineStrictTSConfig({
  rootDir:  __dirname,
  extraIgnores: ['*.config.*']
})