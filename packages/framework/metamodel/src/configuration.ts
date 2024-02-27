import type { GraphEdge, GraphNode } from '@cm2ml/ir'

export interface MetamodelConfiguration<
  Type extends string,
  Tag extends string,
> {
  getTagType: (node: GraphNode | GraphEdge) => Type | undefined
  getType: (node: GraphNode | GraphEdge) => Type | undefined
  isValidTag: (tag: string | undefined) => tag is Tag
  isValidType: (type: string | undefined) => type is Type
  typeAttributeName: string
}
