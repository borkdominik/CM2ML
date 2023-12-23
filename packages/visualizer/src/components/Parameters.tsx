import type { Parameter, ParameterMetadata, ParameterType } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { useEffect } from 'react'

import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export type ParameterValues = Record<string, boolean | number | string>

export interface Props {
  parameters: ParameterMetadata
  setValues: (
    setter: ParameterValues | ((oldValues: ParameterValues) => ParameterValues),
  ) => void
  values: ParameterValues
}

export function Parameters({ parameters, setValues, values }: Props) {
  useEffect(() => {
    const defaultValues = Stream.fromObject(parameters).toRecord(
      ([name]) => name,
      ([, { defaultValue }]) => defaultValue,
    )
    setValues(defaultValues)
  }, [parameters])
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(parameters).map(([name, parameter]) => (
        <ParameterInput
          key={name}
          name={name}
          onChange={(value) =>
            setValues((oldValue) => ({ ...oldValue, [name]: value }))
          }
          parameter={parameter}
          value={values[name] ?? parameter.defaultValue}
        />
      ))}
    </div>
  )
}

export interface ParameterInputProps<T extends ParameterType> {
  name: string
  onChange: (value: boolean | number | string) => void
  parameter: Parameter & { type: T }
  value: T extends 'boolean' ? boolean : T extends 'number' ? number : string
}

export function ParameterInput({
  name,
  onChange,
  parameter,
  value,
}: ParameterInputProps<ParameterType>) {
  switch (parameter.type) {
    case 'boolean':
      return (
        <BooleanParameter
          name={name}
          onChange={onChange}
          parameter={parameter}
          value={value as boolean}
        />
      )
    case 'number':
      return null // TODO: <NumberParameter name={name} parameter={parameter} />
    case 'string':
      return null // TODO: <StringParameter name={name} parameter={parameter} />
  }
}

function BooleanParameter({
  name,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'boolean'>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={name}
          checked={value}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <Label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {name}
        </Label>
      </div>
      <span className="text-xs text-secondary-foreground">
        {parameter.description}
      </span>
    </div>
  )
}
