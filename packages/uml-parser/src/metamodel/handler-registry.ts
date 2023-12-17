import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import type { UmlTag, UmlType } from '../uml'

import { handlers } from './handlers'
import type { Handler } from './metamodel'

export const typeHandlers: Partial<Record<UmlType, Handler>> = {
  Abstraction: handlers.AbstractionHandler,
  Association: handlers.AssociationHandler,
  Class: handlers.ClassHandler,
  DataType: handlers.DataTypeHandler,
  Dependency: handlers.DependencyHandler,
  Enumeration: handlers.EnumerationHandler,
  EnumerationLiteral: handlers.EnumerationLiteralHandler,
  Generalization: handlers.GeneralizationHandler,
  Interface: handlers.InterfaceHandler,
  InterfaceRealization: handlers.InterfaceRealizationHandler,
  LiteralInteger: handlers.LiteralIntegerHandler,
  LiteralUnlimitedNatural: handlers.LiteralUnlimitedNaturalHandler,
  Model: handlers.ModelHandler,
  Operation: handlers.OperationHandler,
  Package: handlers.PackageHandler,
  Parameter: handlers.ParameterHandler,
  PrimitiveType: handlers.PrimitiveTypeHandler,
  Property: handlers.PropertyHandler,
  Realization: handlers.RealizationHandler,
  Substitution: handlers.SubstitutionHandler,
  Usage: handlers.UsageHandler,
}

export const tagHandlers: Partial<Record<UmlTag, Handler>> = {
  interfaceRealization: handlers.InterfaceRealizationHandler,
  ownedAttribute: handlers.PropertyHandler,
  ownedLiteral: handlers.EnumerationLiteralHandler,
  ownedParameter: handlers.ParameterHandler,
  ownedOperation: handlers.OperationHandler,
  substitution: handlers.SubstitutionHandler,
}

export function getHandler(node: GraphNode) {
  const type = Uml.getType(node)
  if (type) {
    return typeHandlers[type]
  }
  const tag = node.tag
  if (Uml.isValidTag(tag)) {
    return tagHandlers[tag]
  }
  return undefined
}
