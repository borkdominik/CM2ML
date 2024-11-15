import type { GraphEdge, ModelMember } from '@cm2ml/ir'

export type ComparisonOperator = '=' | '!=' | '<' | '<=' | '>' | '>='

export type EdgeKeyword = 'id' | 'name' | 'tag' | 'type'

export type NodeKeyword = 'id' | 'name' | 'tag' | 'type'

export interface PathContext {
  step: number
  length: number
}

export type PathContextKey = keyof PathContext

export type Processor<T extends ModelMember, U> = (element: T, context: PathContext) => U

export type Condition<T extends ModelMember> = Processor<T, boolean>

export type Template<T extends ModelMember> = Processor<T, string>

export type ConditionalTemplate<T extends ModelMember> = Processor<T, string | undefined>

export type Selector<T extends ModelMember> = Processor<T, string | undefined>

export type Replacement<T extends ModelMember> = Processor<T, string>

export type StepWeighting = Processor<GraphEdge, number | undefined>
