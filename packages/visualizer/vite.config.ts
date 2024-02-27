import { readFileSync } from 'node:fs'
import path from 'node:path'

import react from '@vitejs/plugin-react'
import { vite as million } from 'million/compiler'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import packageJson from './package.json'

export default defineConfig({
  plugins: [
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
  define: {
    __SOURCE_URL: JSON.stringify(
      packageJson.repository.url.replace('git+', '').replace('.git', ''),
    ),
    __EXAMPLE_MODEL: JSON.stringify(readFileSync('../../models/uml/clazz.uml', 'utf-8')),
    __ARCHIMATE_EXAMPLE_MODEL: JSON.stringify(readFileSync('../../Example.archimate', 'utf-8')),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
