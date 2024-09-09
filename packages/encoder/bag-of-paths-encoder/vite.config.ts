import { readFileSync } from 'node:fs'

import { coverage, library } from 'vite-plugin-lib'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [library()],
  define: {
    __GRAMMAR: JSON.stringify(readFileSync('src/templates/template.ohm', 'utf-8')),
  },
  test: {
    coverage,
  },
})
