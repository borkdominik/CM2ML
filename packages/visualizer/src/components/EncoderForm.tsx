import { encoderMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { useState } from 'react'

import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const encoders = Object.keys(encoderMap)

export interface Props {
  canSubmit: boolean
  setEncoder: (encoding: Plugin<GraphModel, unknown, any>) => void
}

export function EncoderForm({ canSubmit, setEncoder }: Props) {
  const [encoderName, setEncoderName] = useState<string>('')
  return (
    <>
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Encoder</div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter>
          <Button
            disabled={!canSubmit || encoderMap[encoderName] === undefined}
            onClick={() => setEncoder(encoderMap[encoderName]!)}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
