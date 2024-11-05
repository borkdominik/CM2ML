import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/encoders/*/vite.config.ts',
  'packages/framework/*/vite.config.ts',
  'packages/languages/*/vite.config.ts',
  'packages/pattern-mining/*/vite.config.ts',
  'packages/utils/vite.config.ts',
])
