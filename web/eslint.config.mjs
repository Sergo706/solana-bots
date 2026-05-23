import { defineStrictVueConfig } from "@riavzon/utils/eslint/strict/vue"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineStrictVueConfig({
  rootDir: __dirname,
  extraIgnores: ['*.config.*']
})