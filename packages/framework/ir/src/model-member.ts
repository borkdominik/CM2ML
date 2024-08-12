import { type Attributable, type Attribute, type AttributeChangeListener, AttributeDelegate, type AttributeName } from './attributes'
import type { Show } from './ir-utils'
import type { GraphModel } from './model'

export abstract class ModelMember implements Attributable, Show {
  public abstract readonly model: GraphModel
  public abstract readonly tag: string

  readonly #attributeDelegate: AttributeDelegate

  protected constructor(attributeChangeListener: AttributeChangeListener | undefined) {
    this.#attributeDelegate = new AttributeDelegate(attributeChangeListener)
  }

  public get attributes() {
    return this.#attributeDelegate.attributes
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

  public abstract show(indent?: number): string

  public get isRemoved(): boolean {
    return this.model === undefined
  }

  public get id(): string | undefined {
    return this.model.metamodel.getIdAttribute(this)?.value.literal
  }

  /**
   * Set the id of this node, but never overwrite an existing id (that is not empty).
   */
  public set id(id: string) {
    const idAttribute = this.model.metamodel.idAttribute
    this.addAttribute({ name: idAttribute, type: 'string', value: { literal: id } }, !!this.id)
  }

  public get idAttribute(): Attribute | undefined {
    return this.model.metamodel.getIdAttribute(this)
  }

  public requireId(): string {
    if (this.id === undefined) {
      const messageSuffix = this.model.settings.debug ? ` (${this.show()})` : ''
      throw new Error(`Missing ID on node${messageSuffix}`)
    }
    return this.id
  }

  public get type(): string | undefined {
    return this.model.metamodel.getType(this)
  }

  /**
   * Set the type of this node.
   */
  public set type(type: string) {
    this.model.metamodel.setType(this, type)
  }

  public get typeAttribute(): Attribute | undefined {
    return this.model.metamodel.getTypeAttribute(this)
  }

  public get name(): string | undefined {
    return this.nameAttribute?.value.literal
  }

  public get nameAttribute(): Attribute | undefined {
    return this.model.metamodel.getNameAttribute(this)
  }
}
