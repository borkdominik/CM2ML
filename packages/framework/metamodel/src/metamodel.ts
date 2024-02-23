import type { Attributable, GraphEdge, GraphNode } from '@cm2ml/ir'

import type { MetamodelConfiguration } from './configuration'

export function inferAndSaveType<Type extends string, Tag extends string>(
  node: GraphNode,
  type: Type,
  configuration: MetamodelConfiguration<Type, Tag>,
) {
  const currentType = configuration.getType(node)
  if (configuration.isValidType(currentType)) {
    // Valid type attribute already exists
    return
  }
  if (currentType !== undefined && node.model.settings.strict) {
    throw new Error(`Node ${node.id} has invalid type ${currentType}`)
  }
  node.addAttribute({
    name: configuration.typeAttributeName,
    value: { literal: type },
  })
}

export function copyAttributes(source: Attributable, target: Attributable) {
  source.attributes.forEach((attribute) => {
    target.addAttribute(attribute)
  })
}

/**
 * Transform a node to an edge
 * @param node - The node to be transformed
 * @param source - The source, i.e., client of the edge
 * @param target - The target, i.e., supplier of the edge
 * @param tag - The tag of the edge, optional
 * @returns The created edge or undefined if the source or target is undefined
 */
export function transformNodeToEdge(
  node: GraphNode,
  source: GraphNode | undefined,
  target: GraphNode | undefined,
  tag: string,
) {
  if (!source || !target) {
    node.model.removeNode(node)
    return undefined
  }
  const edge = node.model.addEdge(tag, source, target)
  copyAttributes(node, edge)
  node.model.removeNode(node)
  return edge
}

export type Handler<HandlerParameters extends HandlerPropagation> = (
  node: GraphNode,
  parameters: HandlerParameters,
) => void | (() => void)

export interface HandlerPropagation {}

export interface Definition<
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
> {
  generalizations: MetamodelElement<
    Type,
    AbstractType,
    Tag,
    HandlerParameters
  >[]
  assignableTags?: Tag[]
  assignableTypes?: Type[]
}

export class MetamodelElement<
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
> {
  readonly #generalizations = new Set<
    MetamodelElement<Type, AbstractType, Tag, HandlerParameters>
  >()

  readonly #specializations = new Set<
    MetamodelElement<Type, AbstractType, Tag, HandlerParameters>
  >()

  readonly #assignableTypes = new Set<Type>()
  readonly #assignableTags = new Set<Tag>()

  private handler: Handler<HandlerParameters> | undefined

  public readonly type: Type | undefined

  public constructor(
    public readonly name: Type | AbstractType,
    public readonly tag: Tag | undefined,
    public readonly configuration: MetamodelConfiguration<Type, Tag>,
    generalizations?: MetamodelElement<
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >[],
  ) {
    if (configuration.isValidType(name)) {
      this.type = name
    }
    if (tag) {
      this.#assignableTags.add(tag)
    }
    if (this.type) {
      this.#assignableTypes.add(this.type)
    }
    generalizations?.forEach((parent) => {
      parent.specialize(this)
    })
  }

  public get isAbstract(): boolean {
    return this.type === undefined
  }

  public get generalizations(): ReadonlySet<
    MetamodelElement<Type, AbstractType, Tag, HandlerParameters>
  > {
    return this.#generalizations
  }

  public get specializations(): ReadonlySet<
    MetamodelElement<Type, AbstractType, Tag, HandlerParameters>
  > {
    return this.#specializations
  }

  public get allAssignableTags(): ReadonlySet<Tag> {
    return this.#assignableTags
  }

  public get allAssignableTypes(): ReadonlySet<Type> {
    return this.#assignableTypes
  }

  public isAssignable(node: GraphNode | GraphEdge): boolean {
    const type = this.configuration.getType(node)
    if (type) {
      return this.#assignableTypes.has(type)
    }
    const tag = node.tag
    if (this.configuration.isValidTag(tag)) {
      return this.#assignableTags.has(tag)
    }
    // During the transformation, we replace the xmi tags with the UML types, so this additional check is necessary
    if (this.configuration.isValidType(tag)) {
      return this.#assignableTypes.has(tag)
    }
    return false
  }

  public handle(
    node: GraphNode,
    parameters: HandlerParameters,
    visited = new Set<
      MetamodelElement<Type, AbstractType, Tag, HandlerParameters>
    >(),
  ): void {
    if (visited.has(this)) {
      return
    }
    if (!this.handler) {
      const message = `Missing handler defined for metamodel element ${this.name}`
      if (node.model.settings.strict) {
        throw new Error(message)
      }
      node.model.debug(message)
    }
    if (this.type) {
      inferAndSaveType(node, this.type, this.configuration)
      this.narrowType(node)
    }
    const callback = this.handler?.(node, parameters)
    visited.add(this)
    this.generalizations.forEach((parent) => {
      parent.handle(node, parameters, visited)
    })
    if (typeof callback === 'function') {
      callback()
    }
  }

  /**
   * Create a handler for a metamodel element without additional associations over its generalizations.
   * @param attributeDefaults - Can be used to set default values for attributes
   * @returns The created handler
   */
  public createPassthroughHandler(
    attributeDefaults: Record<string, string> = {},
  ) {
    return this.createHandler(() => {}, attributeDefaults)
  }

  public createHandler(
    handler: Handler<HandlerParameters>,
    attributeDefaults: Record<string, string> = {},
  ) {
    if (this.handler !== undefined) {
      throw new Error(`There already is a handler assigned to ${this.name}`)
    }
    this.handler = (node, parameters) => {
      Object.entries(attributeDefaults).forEach(([name, value]) => {
        if (!node.getAttribute(name)) {
          node.addAttribute({ name, value: { literal: value } })
        }
      })
      return handler(node, parameters)
    }
    return this
  }

  public narrowType(node: GraphNode) {
    if (!this?.type) {
    // No type information for narrowing
      return
    }
    const currentType = this.configuration.getType(node)
    if (!currentType) {
    // No type set, set type to provided type
      node.addAttribute({ name: this.configuration.typeAttributeName, value: { literal: this.type } })
      return
    }
    const isNarrowable = [...this.generalizations.values()].find((generalization) => generalization.type === currentType) !== undefined
    if (!isNarrowable) {
      // Current type is not compatible with the provided type, we can't narrow further
      return
    }
    // We can narrow the type further
    node.addAttribute({ name: this.configuration.typeAttributeName, value: { literal: this.type } }, false)
  }

  private specialize(
    specialization: MetamodelElement<
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >,
  ) {
    this.#specializations.add(specialization)
    this.registerSubSpecialization(specialization)
  }

  private registerSubSpecialization(
    specialization: MetamodelElement<
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >,
  ) {
    specialization.#generalizations.add(this)
    specialization.allAssignableTags.forEach((tag) =>
      this.#assignableTags.add(tag),
    )
    specialization.allAssignableTypes.forEach((type) =>
      this.#assignableTypes.add(type),
    )
    this.generalizations.forEach((parent) =>
      parent.registerSubSpecialization(specialization),
    )
  }
}

export function createMetamodel<
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(configuration: MetamodelConfiguration<Type, Tag>) {
  function define(
    name: Type,
    tag: Tag | undefined,
    ...generalizations: MetamodelElement<
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >[]
  ) {
    return new MetamodelElement(name, tag, configuration, generalizations)
  }

  function defineAbstract(
    name: AbstractType,
    ...generalizations: MetamodelElement<
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >[]
  ) {
    return new MetamodelElement(name, undefined, configuration, generalizations)
  }
  return { define, defineAbstract }
}

export function getParentOfType<
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(
  node: GraphNode,
  type: MetamodelElement<Type, AbstractType, Tag, HandlerParameters>,
) {
  if (!node.parent) {
    return undefined
  }
  if (!type.isAssignable(node.parent)) {
    return getParentOfType(node.parent, type)
  }
  return node.parent
}
