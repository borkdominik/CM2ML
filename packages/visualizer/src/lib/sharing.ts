import { encoderMap, parserMap } from '@cm2ml/builtin'
import { decode, encode } from 'base64-compressor'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import type { ParameterValues } from '../components/Parameters'

import { useEncoderState } from './useEncoderState'
import { useModelState } from './useModelState'

/**
 * Share data format.
 * 0: Serialized model.
 * 1: Parser name.
 * 2: Parser parameters.
 * 3: Encoder name.
 * 4: Encoder parameters.
 */
export type ShareData = [string, string | undefined, ParameterValues, string | undefined, ParameterValues]

// 1448

export function useShare() {
  const serializedModel = useModelState.use.serializedModel()
  const parser = useModelState.use.parser()
  const parserParameters = useModelState.use.parameters()

  const encoder = useEncoderState.use.encoder()
  const encoderParameters = useEncoderState.use.parameters()

  async function share() {
    const data: ShareData = [serializedModel, parser?.name, parserParameters, encoder?.name, encoderParameters]
    const encodedHash = await encode(data)
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

      const [serializedModel, parserName, parserParameters, encoderName, encoderParameters] = await decode<ShareData>(hash)

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
