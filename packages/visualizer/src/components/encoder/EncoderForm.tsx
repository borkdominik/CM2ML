import { encoderMap } from '@cm2ml/builtin'

import { useEncoderState } from '../../lib/useEncoderState'
import { useSettings } from '../../lib/useSettings'
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

export function EncoderForm() {
  const { encoder, setEncoder, parameters, setParameters, setIsEditing } =
    useEncoderState()
  const alwaysShowEditors = useSettings((state) => state.alwaysShowEditors)

  return (
    <Card className="max-h-full overflow-y-auto">
      <CardHeader className="space-y-2">
        <Label htmlFor="encoder">Encoder</Label>
        <Select
          name="encoder"
          value={encoder?.name ?? ''}
          onValueChange={(value) => setEncoder(encoderMap[value])}
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
            values={parameters}
            setValues={setParameters}
          />
        ) : null}
        {alwaysShowEditors ? null : (
          <Button
            disabled={encoder === undefined}
            onClick={() => setIsEditing(false)}
          >
            Submit
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
