import type { Parameter, ParameterMetadata, ParameterType } from '@cm2ml/plugin'
import { CaretSortIcon, Cross1Icon, SymbolIcon, TrashIcon } from '@radix-ui/react-icons'
import { Stream } from '@yeger/streams'
import { Fragment, useMemo, useState } from 'react'

import { displayName } from '../lib/displayName'
import { getNewParameters } from '../lib/utils'

import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Checkbox } from './ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { Combobox } from './ui/combobox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

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

const excludedParameters = new Set(['continueOnError'])

export function Parameters({ parameters, setValues, values }: Props) {
  const groupedParameters = useMemo(
    () => {
      const filtered = Object.entries(parameters).filter(([name]) => !excludedParameters.has(name))
      const grouped = Object.groupBy(filtered, ([_name, parameter]) => parameter.group ?? 'Other')
      return Stream
        .fromObject(grouped)
        .map(([group, entries]) => {
          if (entries === undefined) {
            return null
          }
          return [group, entries.sort(([a], [b]) => a.localeCompare(b))] as const
        })
        .filterNonNull()
        .toArray()
        .sort(([a], [b]) => a.localeCompare(b))
    },
    [parameters],
  )
  const [open, setOpen] = useState(() => {
    return !Object.entries(values).every(
      ([name, value]) => parameters[name]?.defaultValue === value,
    )
  })

  if (Object.keys(groupedParameters).length === 0) {
    return null
  }

  const resetParameters = () => {
    setValues(getNewParameters(parameters, {}, undefined))
  }
  return (
    <Card>
      <CardContent className="px-4 py-2">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex items-center justify-between">
            <Label>Parameters</Label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="expand-parameters">
                <CaretSortIcon className="size-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="flex flex-col gap-4 pb-4 pt-3">
              {groupedParameters.map(([group, parameters]) => (
                <Fragment key={group}>
                  <Separator />
                  <ParameterGroup
                    key={group}
                    group={group}
                    parameters={parameters}
                    setValues={setValues}
                    values={values}
                  />
                </Fragment>
              ))}
              <Separator />
              <Button variant="ghost" onClick={resetParameters} className="text-primary mx-auto -mb-2 flex gap-2">
                Reset
                <SymbolIcon className="size-4" />
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

interface ParameterGroupProps {
  group: string
  parameters: [string, Parameter][]
  values: ParameterValues
  setValues: (parameters: ParameterValues) => void
}

function ParameterGroup({ group, parameters, values, setValues }: ParameterGroupProps) {
  const groupName = useDisplayName(group)
  return (
    <div className="flex flex-col gap-4">
      <span className="text-muted-foreground select-none text-sm font-medium">{groupName}</span>
      { parameters.map(([name, parameter]) => (
        <ParameterInput
          key={name}
          name={name}
          label={parameter.displayName}
          onChange={(value) => setValues({ [name]: value })}
          parameter={parameter}
          value={values[name] ?? parameter.defaultValue}
        />
      )) }
    </div>
  )
}

interface ParameterInputProps<T extends ParameterType> {
  name: string
  label: string
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

function ParameterInput({
  name,
  label,
  onChange,
  parameter,
  value,
}: Omit<ParameterInputProps<ParameterType>, 'label'> & { label: string | undefined }) {
  const labelFromName = useDisplayName(name)
  const actualLabel = label ?? labelFromName
  switch (parameter.type) {
    case 'boolean':
      return (
        <BooleanParameter
          name={name}
          label={actualLabel}
          onChange={onChange}
          parameter={parameter}
          value={value as boolean}
        />
      )
    case 'number':
      return (
        <NumberParameter
          name={name}
          label={actualLabel}
          onChange={onChange}
          parameter={parameter}
          value={value as number}
        />
      )
    case 'string':
      return (
        <StringParameter
          name={name}
          label={actualLabel}
          onChange={onChange}
          parameter={parameter}
          value={value as string}
        />
      )
    case 'array<string>':
      return (
        <StringArrayInput
          name={name}
          label={actualLabel}
          onChange={onChange}
          parameter={parameter}
          value={value as readonly string[]}
        />
      )
  }
}

function BooleanParameter({
  name,
  label,
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
        <ParameterLabel name={name} label={label} />
      </div>
      <Description description={parameter.description} />
    </Container>
  )
}

function NumberParameter({
  name,
  label,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'number'>) {
  return (
    <Container>
      <ParameterLabel name={name} label={label} />
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
  label,
  onChange,
  parameter,
  value,
}: ParameterInputProps<'string'>) {
  const input = parameter.allowedValues
    ? (<AllowedValueSelect value={value} allowedValues={parameter.allowedValues} onValueChange={onChange} />)
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
      <ParameterLabel name={name} label={label} />
      {input}
      <Description description={parameter.description} />
    </Container>
  )
}

function StringArrayInput({
  name,
  label,
  onChange,
  parameter,
  value: values,
}: ParameterInputProps<'array<string>'>) {
  const [inputValue, setInputValue] = useState('')
  const onInputConfirmed = () => {
    const trimmed = inputValue.trim()
    if (trimmed === '') {
      return
    }
    setInputValue('')
    onChange([...values, trimmed])
  }

  const input = parameter.allowedValues
    ? (
        <AllowedValueSelect
          allowedValues={parameter.allowedValues}
          onValueChange={(selectedValue) => onChange([...values, selectedValue])}
        />
      )
    : (
        <Input
          id={name}
          value={inputValue}
          type="text"
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
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
            <ParameterLabel name={name} label={label} />
          </div>
          <Description description={parameter.description} />
        </Container>
        <CollapsibleContent>
          <Container>
            {input}
            <Button variant="ghost" onClick={() => onChange([])} className="text-primary mx-auto flex gap-2" disabled={values.length === 0}>
              Clear
              <TrashIcon className="size-4" />
            </Button>
            {
              values.map((value, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} className="flex items-center gap-2  text-xs">
                  <Button variant="ghost" className="-my-1" size="sm" onClick={() => onChange(values.filter((entry) => entry !== value))}>
                    <Cross1Icon className="s-4 text-primary" />
                  </Button>
                  <span className="select-none text-balance font-mono">{value}</span>
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
  value?: string
  allowedValues: string[] | readonly string[]
  onValueChange: (value: string) => void
}

function AllowedValueSelect({ value, allowedValues, onValueChange }: AllowedStringValueSelectProps) {
  const options = useMemo(() => allowedValues.map((allowedValue) => ({ value: allowedValue, label: allowedValue })), [allowedValues])

  if (value) {
    return (
      <Combobox
        options={options}
        externalValue={[value, onValueChange]}
      />
    )
  }
  return (
    <Combobox
      options={options}
      onSelect={onValueChange}
    />
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="flex max-w-xs flex-col gap-2">{children}</div>
}

function ParameterLabel({ name, label }: { name: string, label: string }) {
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
  return useMemo(() => displayName(name), [name])
}
