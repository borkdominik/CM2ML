import { parserMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { getMessage } from '@cm2ml/utils'
import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'

import { useModelParser } from '../../lib/useModelParser'
import { Error } from '../Error'
import type { ParameterValues } from '../Parameters'
import { Parameters } from '../Parameters'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'

const parsers = Object.keys(parserMap)

export interface Props {
  setModel: (model: GraphModel) => void
}

export function ModelForm({ setModel }: Props) {
  const [parserName, setParserName] = useState<string>('')
  const parser = parserMap[parserName]
  const [modelString, setModelString] = useState<string | undefined>('')
  const [parameterValues, setParameterValues] = useState<ParameterValues>({})
  const { model, error } = useModelParser(parser, modelString, parameterValues)
  const [modelUrl, setModelUrl] = useState<string>('')
  const [modelError, setFetchError] = useState<string | undefined>()
  const isValidModelUrl = useMemo(() => isValidUrl(modelUrl), [modelUrl])

  async function onFileLoaded(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const fileType = file.name.split('.').at(-1)
    if (fileType && fileType in parserMap) {
      setParserName(fileType)
    }
    setModelString(await file.text())
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
        setParserName(fileType)
      }
      setModelString(modelString)
    } catch (error: unknown) {
      setFetchError(getMessage(error))
    }
  }

  return (
    <Card className="max-h-full">
      {/* TODO: Fix scrolling */}
      <ScrollArea className="h-full">
        <CardHeader className="space-y-2">
          <Label htmlFor="parser">Parser</Label>
          <Select
            value={parserName}
            onValueChange={(value) => setParserName(value)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select a parser" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Parser</SelectLabel>
                {parsers.map((parser) => (
                  <SelectItem key={parser} value={parser}>
                    {parser}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {parser ? (
            <Parameters
              parameters={parser.parameters}
              values={parameterValues}
              setValues={setParameterValues}
            />
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="model">Model</Label>
            <Textarea
              name="model"
              value={modelString}
              onChange={(event) => setModelString(event.target.value)}
              placeholder="Paste your model here"
            />
            <span className="mx-auto text-muted-foreground">- or -</span>
            <Input type="file" onInput={onFileLoaded} />
            <span className="mx-auto text-muted-foreground">- or -</span>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="URL"
                value={modelUrl}
                onChange={(event) => setModelUrl(event.target.value)}
              />
              <Button onClick={loadModelFromUrl} disabled={!isValidModelUrl}>
                Load
              </Button>
            </div>
            {modelUrl && !isValidModelUrl ? (
              <Error error="Invalid URL" />
            ) : null}
            {modelError ? <Error error={modelError} /> : null}
          </div>
          {error ? <Error error={error} /> : null}
          <Button disabled={!model} onClick={() => setModel(model!)}>
            Submit
          </Button>
        </CardContent>
      </ScrollArea>
    </Card>
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
