import type { GraphNode } from '@cm2ml/ir'

import { Uml, inferAndSaveType } from '../uml'
import type { UmlAbstractType, UmlTag, UmlType } from '../uml'

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

  public readonly type: UmlType | undefined

  public constructor(
    public readonly name: UmlType | UmlAbstractType,
    public readonly tag?: UmlTag,
    generalizations?: MetamodelElement[],
  ) {
    if (Uml.isValidType(name)) {
      this.type = name
    }
    if (tag) {
      this.#assignableTags.add(tag)
    }
    if (this.type) {
      this.#assignableTypes.add(this.type)
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

  private get isAbstract(): boolean {
    return this.type === undefined
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
      const message = `No handler for metamodel element ${this.name}`
      if (node.model.settings.strict) {
        throw new Error(message)
      }
      node.model.debug(message)
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
      throw new Error(`There already is a handler assigned to ${this.name}`)
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
  name: UmlType,
  tag: UmlTag | undefined,
  ...generalizations: MetamodelElement[]
) {
  return new MetamodelElement(name, tag, generalizations)
}

function defineAbstract(
  name: UmlAbstractType,
  ...generalizations: MetamodelElement[]
) {
  return new MetamodelElement(name, undefined, generalizations)
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

export const Element = defineAbstract(Uml.AbstractTypes.Element)

export const NamedElement = defineAbstract(
  Uml.AbstractTypes.NamedElement,
  Element,
)

export const Namespace = defineAbstract(
  Uml.AbstractTypes.Namespace,
  NamedElement,
)

export const RedefinableElement = defineAbstract(
  Uml.AbstractTypes.RedefinableElement,
  NamedElement,
)

export const TemplateableElement = defineAbstract(
  Uml.AbstractTypes.TemplateableElement,
  Element,
)

export const ParameterableElement = defineAbstract(
  Uml.AbstractTypes.ParameterableElement,
  Element,
)

export const PackageableElement = defineAbstract(
  Uml.AbstractTypes.PackageableElement,
  ParameterableElement,
  NamedElement,
)

export const Type = defineAbstract(Uml.AbstractTypes.Type, PackageableElement)

export const Classifier = defineAbstract(
  Uml.AbstractTypes.Classifier,
  Namespace,
  Type,
  TemplateableElement,
  RedefinableElement,
)

export const BehavioredClassifier = defineAbstract(
  Uml.AbstractTypes.BehavioredClassifier,
  Classifier,
)

export const EncapsulatedClassifier = defineAbstract(
  Uml.AbstractTypes.EncapsulatedClassifier,
  Classifier,
)

export const Class = define(
  Uml.Types.Class,
  undefined,
  BehavioredClassifier,
  EncapsulatedClassifier,
)

export const TypedElement = defineAbstract(
  Uml.AbstractTypes.TypedElement,
  NamedElement,
)

export const ConnectableElement = defineAbstract(
  Uml.AbstractTypes.ConnectableElement,
  TypedElement,
)

export const MultiplicityElement = defineAbstract(
  Uml.AbstractTypes.MultiplicityElement,
  Element,
)

export const Parameter = define(
  Uml.Types.Parameter,
  Uml.Tags.ownedParameter,
  ConnectableElement,
  MultiplicityElement,
)

export const BehavioralFeature = defineAbstract(
  Uml.AbstractTypes.BehavioralFeature,
  Element,
)

export const Operation = define(
  Uml.Types.Operation,
  Uml.Tags.ownedOperation,
  TemplateableElement,
  ParameterableElement,
  BehavioralFeature,
)

export const Relationship = defineAbstract(
  Uml.AbstractTypes.Relationship,
  Element,
)

export const DirectedRelationship = defineAbstract(
  Uml.AbstractTypes.DirectedRelationship,
  Relationship,
)

export const Dependency = define(
  Uml.Types.Dependency,
  undefined,
  DirectedRelationship,
  PackageableElement,
)

export const Abstraction = define(Uml.Types.Abstraction, undefined, Dependency)

export const Comment = define(Uml.Types.Comment, undefined, Element)

export const Constraint = define(
  Uml.Types.Constraint,
  undefined,
  PackageableElement,
)

export const ElementImport = define(
  Uml.Types.ElementImport,
  Uml.Tags.elementImport,
  DirectedRelationship,
)

export const PackageImport = define(
  Uml.Types.PackageImport,
  Uml.Tags.packageImport,
  DirectedRelationship,
)

export const PackageMerge = define(
  Uml.Types.PackageMerge,
  Uml.Tags.packageMerge,
  DirectedRelationship,
)

export const Realization = define(Uml.Types.Realization, undefined, Abstraction)

export const TemplateBinding = define(
  Uml.Types.TemplateBinding,
  undefined,
  DirectedRelationship,
)

export const TemplateParameter = define(
  Uml.Types.TemplateParameter,
  undefined,
  Element,
)

export const TemplateParameterSubstitution = define(
  Uml.Types.TemplateParameterSubstitution,
  undefined,
  Element,
)

export const TemplateSignature = define(
  Uml.Types.TemplateSignature,
  undefined,
  Element,
)

export const Usage = define(Uml.Types.Usage, undefined, Dependency)

export const Package = define(
  Uml.Types.Package,
  undefined,
  PackageableElement,
  TemplateableElement,
  Namespace,
)

export const InterfaceRealization = define(
  Uml.Types.InterfaceRealization,
  Uml.Tags.interfaceRealization,
  Realization,
)

export const Generalization = define(
  Uml.Types.Generalization,
  undefined,
  DirectedRelationship,
)

export const ValueSpecification = defineAbstract(
  Uml.AbstractTypes.ValueSpecification,
  TypedElement,
  PackageableElement,
)

export const Feature = defineAbstract(
  Uml.AbstractTypes.Feature,
  RedefinableElement,
)

export const DeploymentTarget = defineAbstract(
  Uml.AbstractTypes.DeploymentTarget,
  NamedElement,
)

export const StructuralFeature = defineAbstract(
  Uml.AbstractTypes.StructuralFeature,
  MultiplicityElement,
  TypedElement,
  Feature,
)

export const Property = define(
  Uml.Types.Property,
  Uml.Tags.ownedAttribute,
  ConnectableElement,
  DeploymentTarget,
  StructuralFeature,
)

export const LiteralSpecification = defineAbstract(
  Uml.AbstractTypes.LiteralSpecification,
  ValueSpecification,
)

export const LiteralInteger = define(
  Uml.Types.LiteralInteger,
  undefined,
  LiteralSpecification,
)

export const LiteralUnlimitedNatural = define(
  Uml.Types.LiteralUnlimitedNatural,
  undefined,
  LiteralSpecification,
)

export const Model = define(Uml.Types.Model, undefined, Package)

export const DataType = define(Uml.Types.DataType, undefined, Classifier)

export const PrimitiveType = define(
  Uml.Types.PrimitiveType,
  undefined,
  DataType,
)

export const DeployedArtifact = defineAbstract(
  Uml.AbstractTypes.DeployedArtifact,
  NamedElement,
)

export const InstanceSpecification = define(
  Uml.Types.InstanceSpecification,
  undefined,
  DeploymentTarget,
  PackageableElement,
  DeployedArtifact,
)

export const Enumeration = define(Uml.Types.Enumeration, undefined, DataType)

export const EnumerationLiteral = define(
  Uml.Types.EnumerationLiteral,
  Uml.Tags.ownedLiteral,
  InstanceSpecification,
)

export const Interface = define(Uml.Types.Interface, undefined, Classifier)

export const Substitution = define(
  Uml.Types.Substitution,
  Uml.Tags.substitution,
  Realization,
)

export const Association = define(
  Uml.Types.Association,
  undefined,
  Relationship,
  Classifier,
)
