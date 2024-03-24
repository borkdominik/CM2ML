import { encoderMap, parserMap } from '@cm2ml/builtin'
import { decode, encode } from 'base64-compressor'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import type { ParameterValues } from '../components/Parameters'

import { useEncoderState } from './useEncoderState'
import { useModelState } from './useModelState'

export interface ShareData {
  /**
   * The serialized model.
   */
  s: string
  /**
   * The parser name.
   */
  p: string | undefined
  /**
   * The parser parameters.
   */
  P: ParameterValues
  /**
   * The encoder name.
   */
  e: string | undefined
  /**
   * The encoder parameters.
   */
  E: ParameterValues
}

export function useShare() {
  const serializedModel = useModelState.use.serializedModel()
  const parser = useModelState.use.parser()
  const parserParameters = useModelState.use.parameters()

  const encoder = useEncoderState.use.encoder()
  const encoderParameters = useEncoderState.use.parameters()

  async function share() {
    const data: ShareData = { s: serializedModel, p: parser?.name, P: parserParameters, e: encoder?.name, E: encoderParameters }
    const json = JSON.stringify(data)
    const encodedHash = await encode(json)
    navigator.clipboard.writeText(`${window.location.href}#${encodedHash}`)
    toast.success('Link copied to clipboard')
  }

  return { share }
}

export function useSharedHashLoader() {
  const setSerializedModel = useModelState.use.setSerializedModel()
  const setParser = useModelState.use.setParser()
  const setParameters = useModelState.use.setParameters()
  const setIsEditingModel = useModelState.use.setIsEditing()

  const setEncoder = useEncoderState.use.setEncoder()
  const setEncoderParameters = useEncoderState.use.setParameters()
  const setIsEditingEncoder = useEncoderState.use.setIsEditing()

  const loadFromHash = useCallback(async () => {
    try {
      const hash = window.location.hash.slice(1)

      if (window.location.hash !== '') {
        clearHash()
      }

      if (!hash) {
        return
      }

      const json = await decode(hash)
      const { s: serializedModel, p: parserName, P: parserParameters, e: encoderName, E: encoderParameters }: ShareData = JSON.parse(json)

      setSerializedModel(serializedModel)
      setParser(parserName ? parserMap[parserName] : undefined)
      setParameters(parserParameters)
      setIsEditingModel(false)

      setEncoder(encoderName ? encoderMap[encoderName] : undefined)
      setEncoderParameters(encoderParameters)
      setIsEditingEncoder(false)

      toast.success('Data loaded from URL')
    } catch (error) {
      toast.error('Failed to load data from URL')
    }
  }, [setParameters, setParser, setSerializedModel, setEncoder, setEncoderParameters])

  useEffect(() => {
    loadFromHash()
  }, [loadFromHash])
}

function clearHash() {
  history.pushState('', document.title, window.location.pathname + window.location.search)
}
