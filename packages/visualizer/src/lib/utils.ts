import type { ParameterMetadata } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StoreApi, UseBoundStore } from 'zustand'

import type { ParameterValues } from '../components/Parameters'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getNewParameters(
  metadata: ParameterMetadata,
  oldParameters: ParameterValues,
  oldMetadata: ParameterMetadata | undefined,
) {
  return Stream.fromObject(metadata).toRecord(
    ([name]) => name,
    ([name, { defaultValue }]) => {
      if (oldMetadata !== undefined && metadata !== oldMetadata && name in oldMetadata) {
        // Prevent same-name parameters of previous plugin from being used
        return defaultValue
      }
      return oldParameters[name] ?? defaultValue
    },
  )
}

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store as OmitCallSignature<WithSelectors<typeof _store>>
}

export type OmitCallSignature<T> = { [K in keyof T]: T[K] } & (T extends new (
  ...args: infer R
) => infer S
  ? new (...args: R) => S
  : unknown)

export function createOpacityRangeMapper(min: number, max: number) {
  const minOpacity = 0.3
  const maxOpacity = 1
  if (min === max) {
    return () => maxOpacity
  }
  return (weight: number) =>
    minOpacity + (maxOpacity - minOpacity) * ((weight - min) / (max - min))
}
