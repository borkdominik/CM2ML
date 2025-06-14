import { readdirSync } from 'node:fs'

import type { PreparedPlugin } from '../src'

export function getPluginsToTest(plugins: PreparedPlugin[]) {
  return plugins
    .filter(isPluginReadyForTest)
    .map((plugin) => {
      const inputDir = getInputDir(plugin)
      return [plugin.name, plugin, inputDir, getInputFiles(inputDir)] as const
    })
}

function isPluginReadyForTest(plugin: PreparedPlugin) {
  const name = plugin.name.toLowerCase()
  if (name.includes('archimate')) {
    return false
  }
  if (name.includes('ecore')) {
    return false
  }
  if (
    name.includes('term-frequency') ||
    name.includes('bag-of-words') ||
    name.includes('triples') ||
    name.includes('embeddings')
  ) {
    return false
  }
  return true
}

function getInputDir(plugin: PreparedPlugin) {
  const basePath = `${import.meta.dirname}/../../../../models`
  const name = plugin.name.toLowerCase().replace('batch-', '')
  if (name.startsWith('uml')) {
    return `${basePath}/uml`
  } else if (name.startsWith('archimate')) {
    return `${basePath}/archimate`
  }
  throw new Error(`Plugin ${name} has no input directory defined.`)
}

function getInputFiles(inputDir: string) {
  return readdirSync(inputDir, { withFileTypes: true })
    .filter((file) => file.name !== '.DS_Store' && !file.isDirectory())
    .map((file) => file.name)
}
