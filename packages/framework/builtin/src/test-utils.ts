import { readdirSync } from 'node:fs'

import type { Plugin } from '@cm2ml/plugin'

export function getPluginsToTest(plugins: Plugin<any, unknown, any, unknown>[]) {
  return plugins
    .filter(isPluginReadyForTest)
    .map((plugin) => {
      const inputDir = getInputDir(plugin)
      return [plugin.name, plugin, inputDir, getInputFiles(inputDir)] as const
    })
}

function isPluginReadyForTest(plugin: Plugin<any, unknown, any, unknown>) {
  const name = plugin.name.toLowerCase()
  if (name.includes('ecore')) {
    return false
  }
  if (name.includes('archimate')) {
    return false
  }
  if (name.includes('tree')) {
    return false
  }
  if (name.includes('one-hot')) {
    return false
  }
  return true
}

function getInputDir(plugin: Plugin<any, unknown, any, unknown>) {
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
