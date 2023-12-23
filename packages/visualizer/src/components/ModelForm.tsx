import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { useModelParser } from '../lib/useModelParser'

import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

export interface Props {
  setModel: (model: GraphModel) => void
}

export function ModelForm({ setModel }: Props) {
  const [modelString, setModelString] = useState<string | undefined>('')
  const { model, error } = useModelParser(modelString)
  return (
    <Card>
      <CardHeader>
        <div className="text-lg font-semibold">Model</div>
      </CardHeader>
      <CardContent>
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
