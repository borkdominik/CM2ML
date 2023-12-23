import { encoderMap } from '@cm2ml/builtin'
import { useState } from 'react'

import { useAppState } from '../../lib/useAppState'
import type { ParameterValues } from '../Parameters'
import { Parameters } from '../Parameters'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
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
  const { setEncoder } = useAppState()
  const [encoderName, setEncoderName] = useState<string>('')
  const encoder = encoderMap[encoderName]
  const [parameters, setParameters] = useState<ParameterValues>({})

  return (
    <>
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Encoder</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select
            value={encoderName}
            onValueChange={(value) => setEncoderName(value)}
          >
            <SelectTrigger className="w-[180px]">
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
          {encoder ? (
            <Parameters
              parameters={encoder.parameters}
              values={parameters}
              setValues={setParameters}
            />
          ) : null}
        </CardContent>
        <CardFooter>
          <Button
            disabled={encoder === undefined}
            onClick={() => setEncoder(encoder!, parameters)}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
