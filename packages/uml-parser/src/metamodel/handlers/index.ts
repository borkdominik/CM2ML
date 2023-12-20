import { type MetamodelElement } from '../metamodel'

import { AbstractionHandler } from './Abstraction'
import { AssociationHandler } from './Association'
import { BehavioredClassifierHandler } from './BehavioredClassifier'
import { ClassHandler } from './Class'
import { ClassifierHandler } from './Classifier'
import { DataTypeHandler } from './DataType'
import { DependencyHandler } from './Dependency'
import { DirectedRelationshipHandler } from './DirectedRelationship'
import { ElementHandler } from './Element'
import { ElementImportHandler } from './ElementImport'
import { EncapsulatedClassifierHandler } from './EncapsulatedClassifier'
import { EnumerationHandler } from './Enumeration'
import { EnumerationLiteralHandler } from './EnumerationLiteral'
import { GeneralizationHandler } from './Generalization'
import { InterfaceHandler } from './Interface'
import { InterfaceRealizationHandler } from './InterfaceRealization'
import { LiteralIntegerHandler } from './LiteralInteger'
import { LiteralUnlimitedNaturalHandler } from './LiteralUnlimitedNatural'
import { ModelHandler } from './Model'
import { MultiplicityElementHandler } from './MultiplicityElement'
import { NamedElementHandler } from './NamedElement'
import { NamespaceHandler } from './Namespace'
import { OperationHandler } from './Operation'
import { PackageHandler } from './Package'
import { PackageableElementHandler } from './PackageableElement'
import { PackageImportHandler } from './PackageImport'
import { PackageMergeHandler } from './PackageMerge'
import { ParameterHandler } from './Parameter'
import { ParameterableElementHandler } from './ParameterableElement'
import { PrimitiveTypeHandler } from './PrimitiveType'
import { PropertyHandler } from './Property'
import { RealizationHandler } from './Realization'
import { RedefinableElementHandler } from './RedefinableElement'
import { RelationshipHandler } from './Relationship'
import { SubstitutionHandler } from './Substitution'
import { TemplateableElementHandler } from './TemplateableElement'
import { TypeHandler } from './Type'
import { TypedElementHandler } from './TypedElement'
import { UsageHandler } from './Usage'

// This record includes ALL handlers.
// Handlers MUST be added to this record, in order to properly instantiate the hierarchy chain.
export const handlers: Record<`${string}Handler`, MetamodelElement> = {
  AbstractionHandler,
  AssociationHandler,
  BehavioredClassifierHandler,
  ClassHandler,
  ClassifierHandler,
  DataTypeHandler,
  DependencyHandler,
  DirectedRelationshipHandler,
  ElementHandler,
  ElementImportHandler,
  EncapsulatedClassifierHandler,
  EnumerationHandler,
  EnumerationLiteralHandler,
  GeneralizationHandler,
  InterfaceHandler,
  InterfaceRealizationHandler,
  LiteralIntegerHandler,
  LiteralUnlimitedNaturalHandler,
  ModelHandler,
  MultiplicityElementHandler,
  NamedElementHandler,
  NamespaceHandler,
  OperationHandler,
  PackageableElementHandler,
  PackageHandler,
  PackageImportHandler,
  PackageMergeHandler,
  ParameterableElementHandler,
  ParameterHandler,
  PrimitiveTypeHandler,
  PropertyHandler,
  RealizationHandler,
  RedefinableElementHandler,
  RelationshipHandler,
  SubstitutionHandler,
  TemplateableElementHandler,
  TypedElementHandler,
  TypeHandler,
  UsageHandler,
}
