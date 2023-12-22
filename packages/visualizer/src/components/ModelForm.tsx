import type { GraphModel } from '@cm2ml/ir'
import { UmlParser } from '@cm2ml/uml-parser'
import { getMessage } from '@cm2ml/utils'
import { useMemo, useState } from 'react'

import { exampleModel } from '../model'

import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

export interface Props {
  setModel: (model: GraphModel) => void
}

export function ModelForm({ setModel }: Props) {
  const [modelString, setModelString] = useState<string | undefined>(
    '' ?? exampleModel,
  )
  const { model, error } = useModelParser(modelString)
  return (
    <Card>
      <CardHeader>
        <div className="text-lg font-semibold">Model</div>
      </CardHeader>
      <CardContent>
        <Label htmlFor="model">Serialized Model</Label>
        <Input
          name="model"
          type="textarea"
          value={modelString}
          onChange={(event) => setModelString(event.target.value)}
        />
        {error ? <div className="text-red-500">{error}</div> : null}
      </CardContent>
      <CardFooter>
        <Button disabled={!model} onClick={() => setModel(model!)}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

function useModelParser(serializedModel: string | undefined) {
  const result = useMemo(() => {
    if (!serializedModel) {
      return {}
    }
    try {
      const model = UmlParser.invoke(serializedModel, {
        debug: false,
        idAttribute: 'id',
        strict: true,
      })
      return { model }
    } catch (error) {
      return { error: getMessage(error) }
    }
  }, [serializedModel])
  return result
}
