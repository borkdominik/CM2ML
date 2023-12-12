import type { GraphNode } from '@cm2ml/ir'

export abstract class UmlElement {
  public abstract isApplicable(_node: GraphNode): boolean

  public refine(_node: GraphNode): void {}
}
