import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import react from '@vitejs/plugin-react'
import { vite as million } from 'million/compiler'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { comlink } from 'vite-plugin-comlink'
import { VitePWA } from 'vite-plugin-pwa'

import packageJson from './package.json'

export default defineConfig({
  plugins: [
    comlink(),
    million({
      auto: {
        threshold: 0.01,
      },
    }) as Plugin,
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'CM2ML',
        short_name: 'CM2ML',
        display: 'standalone',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  worker: {
    plugins: () => [comlink()],
  },
  define: {
    __SOURCE_URL: JSON.stringify(
      packageJson.repository.url.replace('git+', '').replace('.git', ''),
    ),
    __EXAMPLE_MODELS: JSON.stringify(getExampleModels()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

function getExampleModels() {
  const modelsDir = `${import.meta.dirname}/../../models`
  const languages = readdirSync(modelsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  return languages.map(({ name: language }) => {
    return {
      language,
      models: getExampleModelsForLanguage(modelsDir, language),
    }
  })
}

function getExampleModelsForLanguage(modelsDir: string, language: string) {
  const languageDir = path.join(modelsDir, language)
  const modelFiles = readdirSync(languageDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name !== '.DS_Store')
  return modelFiles.map(({ name: modelFile }) => {
    const model = readFileSync(path.join(languageDir, modelFile), 'utf-8')
    return { name: modelFile, model }
  })
}
