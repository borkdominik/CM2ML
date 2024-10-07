#!/usr/bin/env node
/* eslint-disable no-console */
import process from 'node:process'

import { detectDuplicates } from '@cm2ml/scripts'

const dir = process.argv[2]
const limit = (() => {
  const value = process.argv[3]
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
})()

console.log(`Checking for duplicates in ${dir}...`)

try {
  const result = detectDuplicates(dir, limit)
  if (result.length === 0) {
    console.log('No duplicates found...')
    process.exit(0)
  }
  console.log(`Found ${result.length} files with duplicates...`)
  result.forEach(([file, duplicates]) => {
    console.log(`- ${file}`)
    duplicates.forEach((duplicate) => {
      console.log(`  - ${duplicate}`)
    })
  })
} catch (error) {
  console.error(error)
  process.exit(1)
}
