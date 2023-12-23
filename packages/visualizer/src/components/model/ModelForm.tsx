import { parserMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { useModelParser } from '../../lib/useModelParser'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
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
  const { model, error } = useModelParser(modelString, parser)
  return (
    <Card>
      <CardHeader>
        <div className="text-lg font-semibold">Model</div>
      </CardHeader>
      <CardContent>
        <Select
          value={parserName}
          onValueChange={(value) => setParserName(value)}
        >
          <SelectTrigger className="mb-4 w-[180px]">
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
        <Label htmlFor="model">Serialized Model</Label>
        <Textarea
          name="model"
          value={modelString}
          onChange={(event) => setModelString(event.target.value)}
        />
        {error ? <div className="text-destructive">{error}</div> : null}
      </CardContent>
      <CardFooter>
        <Button disabled={!model} onClick={() => setModel(model!)}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
