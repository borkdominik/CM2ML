import { encoderMap } from '@cm2ml/builtin'
import { useState } from 'react'

import { useEncoderState } from '../../lib/useEncoderState'
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

const encoders = Object.keys(encoderMap)

export interface Props {}

export function EncoderForm(_: Props) {
  const {
    encoder: currentEncoder,
    setEncoder,
    parameters,
    setParameters,
  } = useEncoderState()
  const [encoderName, setEncoderName] = useState<string>(
    currentEncoder?.name ?? '',
  )
  const encoder = encoderMap[encoderName]
  const [parameterValues, setParameterValues] =
    useState<ParameterValues>(parameters)

  const onConfirm = () => {
    setEncoder(encoderMap[encoderName])
    setParameters(parameterValues)
  }

  return (
    <Card className="max-h-full overflow-y-auto">
      <CardHeader className="space-y-2">
        <Label htmlFor="encoder">Encoder</Label>
        <Select
          name="encoder"
          value={encoderName}
          onValueChange={(value) => setEncoderName(value)}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select an encoder" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Encoder</SelectLabel>
              {encoders.map((encoder) => (
                <SelectItem key={encoder} value={encoder}>
                  {encoder}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {encoder ? (
          <Parameters
            parameters={encoder.parameters}
            values={parameterValues}
            setValues={setParameterValues}
          />
        ) : null}
        <Button disabled={encoder === undefined} onClick={onConfirm}>
          Submit
        </Button>
      </CardContent>
    </Card>
  )
}
