import type { Attribute } from './attributes'
import type { GraphNode } from './graph-node'
import { showAttribute } from './ir-utils'
import type { GraphModel } from './model'
import { ModelMember } from './model-member'

export class GraphEdge extends ModelMember {
  public constructor(
    public readonly model: GraphModel,
    public readonly tag: string,
    public readonly source: GraphNode,
    public readonly target: GraphNode,
  ) {
    super(undefined)
  }

  public get type(): string | undefined {
    return this.model.metamodel.getType(this)
  }

  /**
   * Set the type of this edge.
   */
  public set type(type: string) {
    this.model.metamodel.setType(this, type)
  }

  public get name(): string | undefined {
    return this.nameAttribute?.value.literal
  }

  public get nameAttribute(): Attribute | undefined {
    return this.model.metamodel.getNameAttribute(this)
  }

  public get isRemoved(): boolean {
    return this.model === undefined
  }

  public show(): string {
    const attributes = [...this.attributes.values()]
      .map((attribute) => showAttribute(attribute))
      .join('')

    return `${this.source.id} -> <${this.tag}${attributes} /> -> ${this.target.id}`
  }
}
