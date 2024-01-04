import type { ParameterMetadata } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ParameterValues } from '../components/Parameters'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getNewParameters(
  metadata: ParameterMetadata,
  oldParameters: ParameterValues,
) {
  return Stream.fromObject(metadata).toRecord(
    ([name]) => name,
    ([name, { defaultValue }]) => oldParameters[name] ?? defaultValue,
  )
}
