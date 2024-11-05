import type { AttributeType, GraphEdge, GraphNode, Metamodel, ModelMember } from '@cm2ml/ir'

export function inferAndSaveType<AttributeName extends string, Type extends string, Tag extends string>(
  node: GraphNode,
  type: Type,
  metamodel: Metamodel<AttributeName, Type, Tag>,
) {
  const currentType = node.type
  if (metamodel.isValidType(currentType)) {
    // Valid type attribute already exists
    return
  }
  if (currentType !== undefined && node.model.settings.strict) {
    throw new Error(`Node ${node.id} has invalid type ${currentType}`)
  }
  node.type = type
}

/**
 * Copies all attributes from the source to the target, excluding the id attribute.
 */
export function copyAttributes(
  source: ModelMember,
  target: ModelMember,
) {
  let idSkipped = false
  source.attributes.forEach((attribute) => {
    if (!idSkipped && source.idAttribute === attribute) {
      idSkipped = true
      return
    }
    target.addAttribute(attribute)
  })
}

/**
 * Transform a node to edges
 * @param node - The node to be transformed
 * @param sources - The sources, i.e., clients of the edge
 * @param targets - The targets, i.e., suppliers of the edge
 * @param tag - The tag of the edge, optional
 * @returns The created edge or undefined if the source or target is undefined
 */
export function transformNodeToEdge(
  node: GraphNode,
  sources: GraphNode[],
  targets: GraphNode[],
  tag: string,
) {
  if (node.model.root === node) {
    throw new Error('Cannot transform root node to edge')
  }
  if (sources.length === 0) {
    throw new Error('Cannot transform node to edge without sources')
  }
  if (targets.length === 0) {
    throw new Error('Cannot transform node to edge without targets')
  }
  if (sources.some((source) => source === node)) {
    throw new Error('Cannot transform node to edge with itself as source')
  }
  if (targets.some((target) => target === node)) {
    throw new Error('Cannot transform node to edge with itself as target')
  }
  // move children to parent
  const children = node.children
  children.forEach((child) => {
    node.removeChild(child)
    node.parent?.addChild(child)
  })
  // create all combinations of edges
  const edges = sources
    .filter((source) => !source.isRemoved)
    .flatMap((source) => {
      return targets
        .filter((target) => !target.isRemoved)
        .map((target) => {
          const edge = node.model.addEdge(tag, source, target)
          copyAttributes(node, edge)
          return edge
        })
    })
  node.model.removeNode(node)
  return edges
}

export type Callback = () => void

export type Handler<HandlerParameters extends HandlerPropagation> = (
  node: GraphNode,
  parameters: HandlerParameters,
) => void | Callback

export interface HandlerPropagation { }

export interface Definition<
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
> {
  generalizations: MetamodelElement<
    AttributeName,
    Type,
    AbstractType,
    Tag,
    HandlerParameters
  >[]
  assignableTags?: Tag[]
  assignableTypes?: Type[]
}

export interface AttributeConfiguration {
  type: AttributeType
  defaultValue?: string
}

export class MetamodelElement<
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
> {
  readonly #generalizations = new Set<
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  >()

  readonly #specializations = new Set<
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  >()

  readonly #assignableTypes = new Set<Type>()
  readonly #assignableTags = new Set<Tag>()

  private handler: Handler<HandlerParameters> | undefined

  public readonly type: Type | undefined

  public constructor(
    public readonly name: Type | AbstractType,
    public readonly tag: Tag | undefined,
    public readonly metamodel: Metamodel<AttributeName, Type, Tag>,
    generalizations?: MetamodelElement<
      AttributeName,
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >[],
  ) {
    if (metamodel.isValidType(name)) {
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
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  > {
    return this.#generalizations
  }

  public get specializations(): ReadonlySet<
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  > {
    return this.#specializations
  }

  public get allAssignableTags(): ReadonlySet<Tag> {
    return this.#assignableTags
  }

  public get allAssignableTypes(): ReadonlySet<Type> {
    return this.#assignableTypes
  }

  public isAssignable(element: GraphNode | GraphEdge): boolean {
    const type = element.type
    if (type !== undefined) {
      return this.#assignableTypes.has(type as Type) // type cast is not an issue for this check
    }
    const tag = element.tag
    if (this.metamodel.isValidTag(tag)) {
      return this.#assignableTags.has(tag)
    }
    // Some parsers might also treat the tag as a type
    if (this.metamodel.isValidType(tag)) {
      return this.#assignableTypes.has(tag)
    }
    return false
  }

  public handle(
    node: GraphNode,
    parameters: HandlerParameters,
    visited = new Set<
      MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
    >(),
  ): Callback[] {
    if (visited.has(this)) {
      return []
    }
    if (!this.handler) {
      const message = `Missing handler defined for metamodel element ${this.name}`
      if (node.model.settings.strict) {
        throw new Error(message)
      }
      node.model.debug('Parser', message)
    }
    if (this.type) {
      inferAndSaveType(node, this.type, this.metamodel)
      this.narrowType(node)
    }
    const callback = this.handler?.(node, parameters)
    visited.add(this)
    const callbacks = [...this.generalizations].flatMap((parent) => {
      return parent.handle(node, parameters, visited)
    })
    if (typeof callback === 'function') {
      callbacks.unshift(callback)
    }
    return callbacks
  }

  /**
   * Create a handler for a metamodel element without additional associations over its generalizations.
   * @param attributeDefaults - Can be used to set default values for attributes
   * @returns The created handler
   */
  public createPassthroughHandler(
    attributeDefaults: Record<string, AttributeConfiguration> = {},
  ) {
    return this.createHandler(() => { }, attributeDefaults)
  }

  public createHandler(
    handler: Handler<HandlerParameters>,
    attributeConfigurations: Record<string, AttributeConfiguration> = {},
  ) {
    if (this.handler !== undefined) {
      throw new Error(`There already is a handler assigned to ${this.name}`)
    }
    this.handler = (node, parameters) => {
      Object.entries(attributeConfigurations).forEach(([name, { type, defaultValue }]) => {
        const existing = node.getAttribute(name)
        if (!existing) {
          if (defaultValue === undefined) {
            return
          }
          node.addAttribute({ name, type, value: { literal: defaultValue } })
          return
        }
        if (existing.type === 'unknown') {
          // @ts-expect-error Evil illegal const assignment
          existing.type = type
          return
        }
        if (existing.type !== type && node.model.settings.strict) {
          throw new Error(`Attribute ${name} has type ${existing.type} but should be ${type}`)
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
    const currentType = node.type
    if (currentType === undefined) {
      // No type set, set type to provided type
      node.type = this.type
      return
    }
    const isNarrowable = [...this.generalizations.values()].find((generalization) => generalization.type === currentType) !== undefined
    if (!isNarrowable) {
      // Current type is not compatible with the provided type, we can't narrow further
      return
    }
    // We can narrow the type further
    node.type = this.type
  }

  private specialize(
    specialization: MetamodelElement<
      AttributeName,
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
      AttributeName,
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
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(configuration: Metamodel<AttributeName, Type, Tag>) {
  function define(
    name: Type,
    tag: Tag | undefined,
    ...generalizations: MetamodelElement<
      AttributeName,
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
      AttributeName,
      Type,
      AbstractType,
      Tag,
      HandlerParameters
    >[]
  ) {
    if (configuration.isValidType(name)) {
      throw new Error(`Attempted to create abstract type with existing type ${name}`)
    }
    return new MetamodelElement(name, undefined, configuration, generalizations)
  }
  return { define, defineAbstract }
}

export function getParentOfType<
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(
  node: GraphNode,
  type: MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>,
) {
  if (!node.parent) {
    return undefined
  }
  if (!type.isAssignable(node.parent)) {
    return getParentOfType(node.parent, type)
  }
  return node.parent
}
