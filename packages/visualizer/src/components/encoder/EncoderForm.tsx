import { encoderMap } from '@cm2ml/builtin'

import { prettifyEncoderName } from '../../lib/pluginNames'
import { useEncoderState } from '../../lib/useEncoderState'
import { useSettings } from '../../lib/useSettings'
import { Parameters } from '../Parameters'
import { Button } from '../ui/button'
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
  const encoder = useEncoderState.use.encoder()
  const setEncoder = useEncoderState.use.setEncoder()
  const parameters = useEncoderState.use.parameters()
  const setParameters = useEncoderState.use.setParameters()
  const setIsEditing = useEncoderState.use.setIsEditing()
  const layout = useSettings.use.layout()

  const hasParameters = encoder?.parameters !== undefined && Object.keys(encoder.parameters).length > 0

  return (
    <div className="max-h-full overflow-y-auto">
      <div className="space-y-4 p-2">
        <div className="space-y-2">
          <Label htmlFor="encoder" className="select-none">
            Encoder
          </Label>
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
                    {prettifyEncoderName(encoder)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {hasParameters || layout === 'compact'
          ? (
            <div className="flex flex-col gap-4">
              {hasParameters
                ? (
                  <Parameters
                    parameters={encoder.parameters}
                    values={parameters}
                    setValues={setParameters}
                  />
                  )
                : null}
              {layout === 'compact'
                ? (
                  <Button
                    disabled={encoder === undefined}
                    onClick={() => setIsEditing(false)}
                    className="select-none"
                  >
                    Submit
                  </Button>
                  )
                : null}
            </div>
            )
          : null}
      </div>
    </div>
  )
}
