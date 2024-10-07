import { readdirSync, readFileSync } from 'node:fs'

export function detectDuplicates(dir: string, limit: number | undefined) {
  const files = readdirSync(dir, { encoding: 'utf-8', withFileTypes: true })
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .slice(0, limit)
  const readFile = (file: string) => readFileSync(`${dir}/${file}`, 'utf-8')
  const duplicates: Record<string, string[]> = {}
  const duplicateFiles = new Set<string>()

  const logProgress = (index: number) => {
    if (files.length < 100 || index % 100 !== 0) {
      return
    }
    // eslint-disable-next-line no-console
    console.log(`${Math.round((index / files.length) * 100)}% (${duplicateFiles.size} duplicates found)`)
  }

  files.forEach((file, index) => {
    if (duplicateFiles.has(file)) {
      return
    }
    const fileContent = readFile(file)
    const otherFiles = files.slice(index + 1)
    for (const otherFile of otherFiles) {
      if (duplicateFiles.has(otherFile)) {
        continue
      }
      const otherFileContent = readFile(otherFile)
      if (fileContent === otherFileContent) {
        duplicates[file] = duplicates[file] ?? []
        duplicates[file].push(otherFile)
        duplicateFiles.add(otherFile)
      }
    }
    logProgress(index)
  })
  return Object.entries(duplicates)
}
