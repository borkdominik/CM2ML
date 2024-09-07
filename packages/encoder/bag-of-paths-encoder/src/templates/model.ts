import type { ModelMember } from '@cm2ml/ir'

export type ConditionOperator = '=' | '!='

export type Keyword = 'id' | 'name' | 'tag' | 'type'

export type Condition<T extends ModelMember> = (element: T) => boolean

export type Template<T extends ModelMember> = (element: T) => string

export type ConditionalTemplate<T extends ModelMember> = (element: T) => string | undefined

export type Selector<T extends ModelMember> = (element: T) => string | undefined

export type Replacement<T extends ModelMember> = (element: T, partialReplacement: string) => string
