import type { Parameter, ParameterMetadata, ParameterType } from '@cm2ml/plugin'
import { CaretSortIcon, Cross1Icon, SymbolIcon, TrashIcon } from '@radix-ui/react-icons'
import { Stream } from '@yeger/streams'
import { useMemo, useState } from 'react'

import { getNewParameters } from '../lib/utils'

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

export type ParameterValues = Record<string, boolean |
  number |
  string |
  // readonly boolean[] |
  // readonly number[] |
  readonly string[]>

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

  const resetParameters = () => {
    setValues(getNewParameters(parameters, {}, undefined))
  }
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
        <Container>
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
          <Button variant="ghost" onClick={resetParameters} className="text-primary mx-auto flex gap-2">
            Reset
            <SymbolIcon className="size-4" />
          </Button>
        </Container>
      </CollapsibleContent>
    </Collapsible>
  )
}

export interface ParameterInputProps<T extends ParameterType> {
  name: string
  onChange: (value: boolean | number | string | string[]) => void
  parameter: Parameter & { type: T }
  value: T extends 'boolean' ? boolean
    : T extends 'number' ? number
      : T extends 'string' ? string
        // : T extends 'array<boolean>' ? readonly boolean[]
        //   : T extends 'array<number>' ? readonly number[]
        : T extends 'array<string>' ? readonly string[]
          : never
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
    case 'array<string>':
      return (
        <StringArrayInput
          name={name}
          onChange={onChange}
          parameter={parameter}
          value={value as readonly string[]}
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
  const input = parameter.allowedValues
    ? (<AllowedValueSelect name={name} value={value} allowedValues={parameter.allowedValues} onValueChange={onChange} />)
    : (
      <Input
        id={name}
        value={value}
        type="text"
        onChange={(event) => onChange(event.target.value)}
      />
      )
  return (
    <Container>
      <ParameterLabel name={name} />
      {input}
      <Description description={parameter.description} />
    </Container>
  )
}

function StringArrayInput({
  name,
  onChange,
  parameter,
  value: values,
}: ParameterInputProps<'array<string>'>) {
  const [inputValue, setInputValue] = useState('')
  if (!parameter.allowedValues) {
    return null
  }
  const onInputConfirmed = () => {
    setInputValue('')
    onChange([...values, inputValue])
  }

  const input = parameter.allowedValues
    ? (
      <AllowedValueSelect
        name={name}
        allowedValues={parameter.allowedValues}
        onValueChange={(selectedValue) => onChange([...values, selectedValue])}
      />
      )
    : (
      <Input
        id={name}
        value={inputValue}
        type="text"
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={onInputConfirmed}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onInputConfirmed()
          }
        }}
      />
      )
  return (
    <Collapsible>
      <Container>
        <Container>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="-mx-3">
                <CaretSortIcon className="size-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
            <ParameterLabel name={name} />
          </div>
          <Description description={parameter.description} />
        </Container>
        <CollapsibleContent>
          <Container>
            <Button variant="ghost" onClick={() => onChange([])} className="text-primary mx-auto flex gap-2">
              Clear
              <TrashIcon className="size-4" />
            </Button>
            {input}
            {
              values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onChange(values.filter((entry) => entry !== value))}>
                    <Cross1Icon className="s-4 text-primary" />
                  </Button>
                  <ParameterLabel name={value} />
                </div>
              ))
          }
          </Container>
        </CollapsibleContent>
      </Container>
    </Collapsible>
  )
}

interface AllowedStringValueSelectProps {
  name: string
  value?: string
  allowedValues: string[] | readonly string[]
  onValueChange: (value: string) => void
}

function AllowedValueSelect({ name, value, allowedValues, onValueChange }: AllowedStringValueSelectProps) {
  return (
    <Select
      name={name}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="max-w-xs">
        <SelectValue placeholder="Select a value" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Value</SelectLabel>
          {allowedValues.map((allowedValue) => (
            <SelectItem key={allowedValue} value={allowedValue}>
              {allowedValue}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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
    <span className="text-muted-foreground select-none text-balance text-xs">
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
