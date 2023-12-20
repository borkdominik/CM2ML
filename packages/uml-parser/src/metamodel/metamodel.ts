import type { GraphNode } from '@cm2ml/ir'

import { Uml, inferAndSaveType } from '../uml'
import type { UmlTag, UmlType } from '../uml'

export interface Handler {
  handle: (node: GraphNode) => void
}

export interface Definition {
  generalizations: MetamodelElement[]
  assignableTags?: UmlTag[]
  assignableTypes?: UmlType[]
}

export class MetamodelElement implements Handler {
  readonly #generalizations = new Set<MetamodelElement>()
  readonly #specializations = new Set<MetamodelElement>()

  readonly #assignableTags = new Set<UmlTag>()
  readonly #assignableTypes = new Set<string>()

  private handler: Handler['handle'] | undefined

  public constructor(
    public readonly name: string,
    public readonly isAbstract: boolean,
    public readonly tag?: UmlTag,
    public readonly type?: UmlType,
    generalizations?: MetamodelElement[],
  ) {
    if (tag) {
      this.#assignableTags.add(tag)
    }
    if (type) {
      this.#assignableTypes.add(type)
    }
    generalizations?.forEach((parent) => {
      if (this.isAbstract && !parent.isAbstract) {
        throw new Error(
          `Parent ${parent.name} of abstract element ${this.name} must also be abstract`,
        )
      }
      this.#generalizations.add(parent)
      parent.specialize(this)
    })
  }

  public get generalizations(): ReadonlySet<MetamodelElement> {
    return this.#generalizations
  }

  public get specializations(): ReadonlySet<MetamodelElement> {
    return this.#specializations
  }

  public get allAssignableTags(): ReadonlySet<UmlTag> {
    return this.#assignableTags
  }

  public get allAssignableTypes(): ReadonlySet<string> {
    return this.#assignableTypes
  }

  public isAssignable(node: GraphNode): boolean {
    const type = Uml.getType(node)
    if (type) {
      return this.#assignableTypes.has(type)
    }
    const tag = node.tag
    if (Uml.isValidTag(tag)) {
      return this.#assignableTags.has(tag)
    }
    // During the transformation, we replace the xmi tags with the UML types, so this additional check is necessary
    if (Uml.isValidType(tag)) {
      return this.#assignableTypes.has(tag)
    }
    return false
  }

  public handle(node: GraphNode, visited = new Set<MetamodelElement>()): void {
    if (visited.has(this)) {
      return
    }
    if (!this.handler) {
      node.model.debug(`No handler for metamodel element ${this.name}`)
    }
    if (this.type) {
      inferAndSaveType(node, this.type)
    }
    this.handler?.(node)
    visited.add(this)
    this.generalizations.forEach((parent) => {
      parent.handle(node, visited)
    })
  }

  public createHandler(handler: Handler['handle'] = () => {}) {
    if (this.handler !== undefined) {
      throw new Error('Handler already assigned')
    }
    this.handler = handler
    return this
  }

  private specialize(specialization: MetamodelElement) {
    this.#specializations.add(specialization)
    this.registerSubSpecialization(specialization)
  }

  private registerSubSpecialization(specialization: MetamodelElement) {
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

function define(
  assignableTag: UmlTag | undefined,
  assignableType: UmlType,
  ...generalizations: MetamodelElement[]
) {
  return new MetamodelElement(
    assignableType,
    false,
    assignableTag,
    assignableType,
    generalizations,
  )
}

function defineAbstract(name: string, ...generalizations: MetamodelElement[]) {
  return new MetamodelElement(name, true, undefined, undefined, generalizations)
}

export function getParentOfType(node: GraphNode, type: MetamodelElement) {
  if (!node.parent) {
    return undefined
  }
  if (!type.isAssignable(node.parent)) {
    return getParentOfType(node.parent, type)
  }
  return node.parent
}

export function requireImmediateParentOfType(
  node: GraphNode,
  type: MetamodelElement,
) {
  if (!node.parent) {
    throw new Error(
      `Missing parent for node ${node.tag} (${node.id}) of type ${Uml.getType(
        node,
      )}`,
    )
  }
  if (!type.isAssignable(node.parent)) {
    throw new Error(
      `Parent ${node.parent.tag} (${node.parent.id}) of node ${node.tag} (${node.id}) is not of type ${type.name}`,
    )
  }
  return node.parent
}

export const Element = defineAbstract('Element')

export const NamedElement = defineAbstract('NamedElement', Element)

export const Namespace = defineAbstract('Namespace', NamedElement)

export const RedefinableElement = defineAbstract(
  'RedefinableElement',
  NamedElement,
)

export const Classifier = defineAbstract(
  'Classifier',
  Namespace,
  RedefinableElement,
)

export const BehavioredClassifier = defineAbstract(
  'BehavioredClassifier',
  Classifier,
)

export const EncapsulatedClassifier = defineAbstract(
  'EncapsulatedClassifier',
  Classifier,
)

export const Class = define(
  undefined,
  Uml.Types.Class,
  BehavioredClassifier,
  EncapsulatedClassifier,
)

export const TypedElement = defineAbstract('TypedElement', NamedElement)

export const ConnectableElement = defineAbstract(
  'ConnectableElement',
  TypedElement,
)

export const MultiplicityElement = defineAbstract(
  'MultiplicityElement',
  Element,
)

export const Parameter = define(
  Uml.Tags.ownedParameter,
  Uml.Types.Parameter,
  ConnectableElement,
  MultiplicityElement,
)

export const TemplateableElement = defineAbstract(
  'TemplateableElement',
  Element,
)

export const ParameterableElement = defineAbstract(
  'ParameterableElement',
  Element,
)

export const BehavioralFeature = defineAbstract('BehavioralFeature', Element)

export const Operation = define(
  Uml.Tags.ownedOperation,
  Uml.Types.Operation,
  TemplateableElement,
  ParameterableElement,
  BehavioralFeature,
)

export const Relationship = defineAbstract('Relationship', Element)

export const DirectedRelationship = defineAbstract(
  'DirectedRelationship',
  Relationship,
)

export const PackageableElement = defineAbstract(
  'PackageableElement',
  ParameterableElement,
  NamedElement,
)

export const Dependency = define(
  undefined,
  Uml.Types.Dependency,
  DirectedRelationship,
  PackageableElement,
)

// TODO
export const Abstraction = define(undefined, Uml.Types.Abstraction, Dependency)

export const Comment = define(undefined, Uml.Types.Comment, Element)

export const Constraint = define(
  undefined,
  Uml.Types.Constraint,
  PackageableElement,
)

export const ElementImport = define(
  Uml.Tags.elementImport,
  Uml.Types.ElementImport,
  DirectedRelationship,
)

export const PackageImport = define(
  Uml.Tags.packageImport,
  Uml.Types.PackageImport,
  DirectedRelationship,
)

export const PackageMerge = define(
  Uml.Tags.packageMerge,
  Uml.Types.PackageMerge,
  DirectedRelationship,
)

// TODO
export const Realization = define(undefined, Uml.Types.Realization, Abstraction)

// TODO
export const TemplateBinding = define(
  undefined,
  Uml.Types.TemplateBinding,
  DirectedRelationship,
)

// TODO
export const TemplateParameter = define(
  undefined,
  Uml.Types.TemplateParameter,
  Element,
)

// TODO
export const TemplateParameterSubstitution = define(
  undefined,
  Uml.Types.TemplateParameterSubstitution,
  Element,
)

// TODO
export const TemplateSignature = define(
  undefined,
  Uml.Types.TemplateSignature,
  Element,
)

export const Type = defineAbstract('Type', PackageableElement)

export const Usage = define(undefined, Uml.Types.Usage, Dependency)

export const Package = define(
  undefined,
  Uml.Types.Package,
  PackageableElement,
  TemplateableElement,
  Namespace,
)

export const InterfaceRealization = define(
  Uml.Tags.interfaceRealization,
  Uml.Types.InterfaceRealization,
  Realization,
)

// TODO
export const Generalization = define(
  undefined,
  Uml.Types.Generalization,
  DirectedRelationship,
)

export const ValueSpecification = defineAbstract(
  'ValueSpecification',
  TypedElement,
  PackageableElement,
)

export const Feature = defineAbstract('Feature', RedefinableElement)

export const DeploymentTarget = defineAbstract('DeploymentTarget', NamedElement)

export const StructuralFeature = defineAbstract(
  'StructuralFeature',
  MultiplicityElement,
  TypedElement,
  Feature,
)

export const Property = define(
  Uml.Tags.ownedAttribute,
  Uml.Types.Property,
  ConnectableElement,
  DeploymentTarget,
  StructuralFeature,
)

export const LiteralSpecification = defineAbstract(
  'LiteralSpecification',
  ValueSpecification,
)

export const LiteralInteger = define(
  undefined,
  Uml.Types.LiteralInteger,
  LiteralSpecification,
)

export const LiteralUnlimitedNatural = define(
  undefined,
  Uml.Types.LiteralUnlimitedNatural,
  LiteralSpecification,
)

export const Model = define(undefined, Uml.Types.Model, Package)

export const DataType = define(undefined, Uml.Types.DataType, Classifier)

export const PrimitiveType = define(
  undefined,
  Uml.Types.PrimitiveType,
  DataType,
)

export const DeployedArtifact = defineAbstract('DeployedArtifact', NamedElement)

export const InstanceSpecification = define(
  undefined,
  Uml.Types.InstanceSpecification,
  DeploymentTarget,
  PackageableElement,
  DeployedArtifact,
)

export const Enumeration = define(undefined, Uml.Types.Enumeration, DataType)

export const EnumerationLiteral = define(
  Uml.Tags.ownedLiteral,
  Uml.Types.EnumerationLiteral,
  InstanceSpecification,
)

export const Interface = define(undefined, Uml.Types.Interface, Classifier)

export const Substitution = define(
  Uml.Tags.substitution,
  Uml.Types.Substitution,
  Realization,
)

export const Association = define(
  undefined,
  Uml.Types.Association,
  Relationship,
  Classifier,
)

// TODO: VisibilityKind enumeration
