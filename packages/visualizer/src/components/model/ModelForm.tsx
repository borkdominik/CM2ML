import { ArchimateParser, parserMap, UmlParser } from '@cm2ml/builtin'
import { getMessage } from '@cm2ml/utils'
import { xml } from '@codemirror/lang-xml'
import CodeMirror from '@uiw/react-codemirror'
import { debounce } from '@yeger/debounce'
import type { ChangeEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { prettifyParserName } from '../../lib/pluginNames'
import { useModelState } from '../../lib/useModelState'
import { useSettings } from '../../lib/useSettings'
import { useTheme } from '../../lib/useTheme'
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
  const theme = useTheme.use.theme()

  const codeMirrorLanguage = useMemo(() => {
    if (parser === UmlParser) {
      return xml()
    }
    if (parser === ArchimateParser) {
      return xml()
    }
    return xml()
  }, [parser])

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

  const debouncedSetSerializedModel = useCallback(debounce(setSerializedModel, 1000), [setSerializedModel])

  return (
    <div className="max-h-full overflow-y-auto" data-testid="model-form">
      <div className="space-y-4 p-2">
        <div className="space-y-2">
          <Label htmlFor="parser">
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
            <Label>
              Model
            </Label>
            <div className="max-h-96 overflow-y-auto rounded border">
              <CodeMirror
                value={serializedModel}

                onChange={debouncedSetSerializedModel}
                placeholder="Paste your model here"
                theme={theme}
                extensions={[codeMirrorLanguage]}
              />
            </div>
            <Or />
            <Input type="file" onInput={onFileLoaded} />
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
    <span className="text-muted-foreground mx-auto flex w-full items-center gap-2 text-xs">
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
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    return false
  }
}
