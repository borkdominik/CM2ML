import type { Parameter, ParameterMetadata, ParameterType } from '@cm2ml/plugin'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { Stream } from '@yeger/streams'
import { useMemo, useState } from 'react'

import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export type ParameterValues = Record<string, boolean | number | string>

export interface Props {
  parameters: ParameterMetadata
  setValues: (parameters: ParameterValues) => void
  values: ParameterValues
}

export function Parameters({ parameters, setValues, values }: Props) {
  const sortedParameters = useMemo(
    () => Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)),
    [parameters],
  )
  const [open, setOpen] = useState(() => {
    return !Object.entries(values).every(
      ([name, value]) => parameters[name]?.defaultValue === value,
    )
  })
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <Label>Parameters</Label>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <CaretSortIcon className="size-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 pt-4">
          {sortedParameters.map(([name, parameter]) => (
            <ParameterInput
              key={name}
              name={name}
              onChange={(value) => setValues({ [name]: value })}
              parameter={parameter}
              value={values[name] ?? parameter.defaultValue}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
      return (
        <NumberParameter
          name={name}
          onChange={onChange}
          parameter={parameter}
          value={value as number}
        />
      )
    case 'string':
      return (
        <StringParameter
          name={name}
          onChange={onChange}
          parameter={parameter}
          value={value as string}
        />
      )
  }
}

function BooleanParameter({
  name,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'boolean'>) {
  return (
    <Container>
      <div className="flex items-center gap-2">
        <Checkbox
          id={name}
          checked={value}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <ParameterLabel name={name} />
      </div>
      <Description description={parameter.description} />
    </Container>
  )
}

function NumberParameter({
  name,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'number'>) {
  return (
    <Container>
      <ParameterLabel name={name} />
      <Input
        id={name}
        value={value}
        type="number"
        onChange={(event) => onChange(Number(event.target.value))}
      />

      <Description description={parameter.description} />
    </Container>
  )
}

function StringParameter({
  name,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'string'>) {
  if (parameter.allowedValues) {
    return (
      <Container>
        <ParameterLabel name={name} />
        <Select
          name={name}
          value={value}
          onValueChange={(selectedValue) => onChange(selectedValue)}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Value</SelectLabel>
              {parameter.allowedValues.map((allowedValue) => (
                <SelectItem key={allowedValue} value={allowedValue}>
                  {allowedValue}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Description description={parameter.description} />
      </Container>
    )
  }
  return (
    <Container>
      <ParameterLabel name={name} />
      <Input
        id={name}
        value={value}
        type="text"
        onChange={(event) => onChange(event.target.value)}
      />
      <Description description={parameter.description} />
    </Container>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="flex max-w-xs flex-col gap-2">{children}</div>
}

function ParameterLabel({ name }: { name: string }) {
  const label = useDisplayName(name)
  return (
    <Label htmlFor={name} className="select-none text-balance">
      {label}
    </Label>
  )
}

function Description({ description }: { description: string }) {
  return (
    <span className="select-none text-balance text-xs text-muted-foreground">
      {description}
    </span>
  )
}

function useDisplayName(name: string) {
  return useMemo(() => {
    let displayName = ''
    Stream.from(name.replaceAll('-', ' ')).forEach((character) => {
      if (character === character.toUpperCase()) {
        displayName += ` ${character}`
        return
      }
      displayName += character
    })
    displayName = displayName[0]?.toUpperCase() + displayName.slice(1)
    return displayName.trim()
  }, [name])
}
