import type { Attributable, Attribute, AttributeName } from './attributes'
import { AttributeDelegate } from './attributes'
import type { GraphNode } from './graph-node'
import { type Show, showAttribute } from './ir-utils'
import type { GraphModel } from './model'
import type { ModelMember } from './model-member'

export class GraphEdge implements Attributable, ModelMember, Show {
  readonly #attributeDelegate = new AttributeDelegate(undefined)
  public readonly attributes = this.#attributeDelegate.attributes

  public constructor(
    public readonly model: GraphModel,
    public readonly tag: string,
    public readonly source: GraphNode,
    public readonly target: GraphNode,
  ) { }

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

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributeDelegate.getAttribute(name)
  }

  public addAttribute(
    attribute: Attribute,
    preventOverwrite?: boolean | undefined,
  ): void {
    this.#attributeDelegate.addAttribute(attribute, preventOverwrite)
  }

  public removeAttribute(name: AttributeName) {
    return this.#attributeDelegate.removeAttribute(name)
  }

  public show(): string {
    const attributes = [...this.attributes.values()]
      .map((attribute) => showAttribute(attribute))
      .join('')

    return `${this.source.id} -> <${this.tag}${attributes} /> -> ${this.target.id}`
  }
}
