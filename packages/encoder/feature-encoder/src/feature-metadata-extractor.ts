import { METADATA_KEY } from '@cm2ml/plugin'
import { getMessage } from '@cm2ml/utils'

export function getFeatureMetadataFromFile(fileContent: string, key: 'edgeFeatures' | 'nodeFeatures') {
  try {
    const parsed = JSON.parse(fileContent)
    const path = `${METADATA_KEY}.${key}`
    const pathSegments = path.split('.')

    function followPath(obj: unknown, segments: string[]) {
      if (segments.length === 0) {
        return obj
      }
      const [segment, ...rest] = segments
      if (!segment || typeof obj !== 'object' || obj === null || !(segment in obj)) {
        throw new Error(`Path not found: ${path}`)
      }
      // @ts-expect-error - we know that obj is an object and it contains segment
      const nextObj: unknown = obj[segment]
      return followPath(nextObj, rest)
    }

    const result = followPath(parsed, pathSegments)
    return JSON.stringify(result)
  } catch (error) {
    throw new Error(`Unable to extract metadata from file: ${getMessage(error)}`)
  }
}
