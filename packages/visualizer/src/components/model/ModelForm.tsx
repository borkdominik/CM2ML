import { parserMap } from '@cm2ml/builtin'
import { getMessage } from '@cm2ml/utils'
import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'

import { prettifyParserName } from '../../lib/pluginNames'
import { useModelState } from '../../lib/useModelState'
import { useSettings } from '../../lib/useSettings'
import { Error } from '../Error'
import { Parameters } from '../Parameters'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Textarea } from '../ui/textarea'

const parsers = Object.keys(parserMap)

export function ModelForm() {
  const model = useModelState.use.model()
  const error = useModelState.use.error()
  const serializedModel = useModelState.use.serializedModel()
  const setSerializedModel = useModelState.use.setSerializedModel()
  const parameters = useModelState.use.parameters()
  const setParameters = useModelState.use.setParameters()
  const parser = useModelState.use.parser()
  const setParser = useModelState.use.setParser()
  const setIsEditing = useModelState.use.setIsEditing()
  const [modelUrl, setModelUrl] = useState<string>('')
  const [modelError, setFetchError] = useState<string | undefined>()
  const isValidModelUrl = useMemo(() => isValidUrl(modelUrl), [modelUrl])
  const layout = useSettings.use.layout()

  async function onFileLoaded(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const fileType = file.name.split('.').at(-1)
    if (fileType && fileType in parserMap) {
      setParser(parserMap[fileType])
    }
    setSerializedModel(await file.text())
    setModelUrl('')
    setFetchError(undefined)
  }

  async function loadModelFromUrl() {
    setFetchError(undefined)
    try {
      const response = await fetch(modelUrl)
      if (!response.ok) {
        setFetchError(response.statusText)
      }
      const modelString = await response.text()
      const fileType = modelUrl.split('.').at(-1)
      if (fileType && fileType in parserMap) {
        setParser(parserMap[fileType])
      }
      setSerializedModel(modelString)
      setModelUrl('')
    } catch (error: unknown) {
      setFetchError(getMessage(error))
    }
  }

  return (
    <div className="max-h-full overflow-y-auto" data-testid="model-form">
      <div className="space-y-4 p-2">
        <div className="space-y-2">
          <Label htmlFor="parser" className="select-none">
            Parser
          </Label>
          <Select
            value={parser?.name ?? ''}
            onValueChange={(value) => setParser(parserMap[value])}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select a parser" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Parser</SelectLabel>
                {parsers.map((parser) => (
                  <SelectItem key={parser} value={parser}>
                    {prettifyParserName(parser)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-6">
          {parser
            ? (
                <Parameters
                  parameters={parser.parameters}
                  values={parameters}
                  setValues={setParameters}
                />
              )
            : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="model" className="select-none">
              Model
            </Label>
            <Textarea
              name="model"
              value={serializedModel}
              onChange={(event) => setSerializedModel(event.target.value)}
              placeholder="Paste your model here"
            />
            <Or />
            <Input type="file" onInput={onFileLoaded} className="select-none" />
            <Or />
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="URL"
                value={modelUrl}
                onChange={(event) => setModelUrl(event.target.value)}
              />
              <Button
                onClick={loadModelFromUrl}
                disabled={!isValidModelUrl}
                className="select-none"
              >
                Load
              </Button>
            </div>
            {modelUrl && !isValidModelUrl ? <Error error="Invalid URL" /> : null}
            {modelError ? <Error error={modelError} /> : null}
          </div>
          {error ? <Error error={error} /> : null}
          {layout === 'compact'
            ? (
                <Button
                  disabled={!model}
                  onClick={() => setIsEditing(false)}
                  className="select-none"
                >
                  Submit
                </Button>
              )
            : null}
        </div>
      </div>
    </div>
  )
}

function Or() {
  return (
    <span className="mx-auto flex w-full select-none items-center gap-2 text-xs text-muted-foreground">
      <Separator className="shrink" />
      or
      <Separator className="shrink" />
    </span>
  )
}

function isValidUrl(string: string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}
