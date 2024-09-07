import type { ModelMember } from '@cm2ml/ir'

export type ComparisonOperator = '=' | '!=' | '<' | '<=' | '>' | '>='

export type Keyword = 'id' | 'name' | 'tag' | 'type' | 'step'

export type Processor<T extends ModelMember, U> = (element: T, step: number) => U

export type Condition<T extends ModelMember> = Processor<T, boolean>

export type Template<T extends ModelMember> = Processor<T, string>

export type ConditionalTemplate<T extends ModelMember> = Processor<T, string | undefined>

export type Selector<T extends ModelMember> = Processor<T, string | undefined>

export type Replacement<T extends ModelMember> = Processor<T, string>
