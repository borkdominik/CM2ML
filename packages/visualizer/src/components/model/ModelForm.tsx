import { parserMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { useModelParser } from '../../lib/useModelParser'
import { Error } from '../Error'
import type { ParameterValues } from '../Parameters'
import { Parameters } from '../Parameters'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
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
  return (
    <Card>
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
          <Label htmlFor="model">Serialized Model</Label>
          <Textarea
            name="model"
            value={modelString}
            onChange={(event) => setModelString(event.target.value)}
          />
        </div>
        {error ? <Error error={error} /> : null}
        <Button disabled={!model} onClick={() => setModel(model!)}>
          Submit
        </Button>
      </CardContent>
    </Card>
  )
}
