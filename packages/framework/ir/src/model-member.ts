import type { GraphModel } from './model'

export interface ModelMember {
  readonly name: string | undefined
  readonly model: GraphModel
  readonly isRemoved: boolean
}
