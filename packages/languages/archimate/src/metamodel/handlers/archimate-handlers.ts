import { Access, Aggregation, AndJunction, ApplicationCollaboration, ApplicationComponent, ApplicationEvent, ApplicationFunction, ApplicationInteraction, ApplicationInterface, ApplicationProcess, ApplicationService, type ArchimateMetamodelElement, Artifact, Assessment, Assignment, Association, BusinessActor, BusinessCollaboration, BusinessEvent, BusinessFunction, BusinessInteraction, BusinessInterface, BusinessObject, BusinessProcess, BusinessRole, BusinessService, Capability, CommunicationNetwork, Composition, Constraint, Contract, CourseOfAction, DataObject, Deliverable, Device, DistributionNetwork, Driver, Equipment, Facility, Flow, Gap, Goal, Grouping, ImplementationEvent, Influence, Junction, Location, Material, Meaning, Node, OrJunction, Outcome, Path, Plateau, Principle, Product, Realization, Representation, Requirement, Resource, Serving, Specialization, Stakeholder, SystemSoftware, TechnologyCollaboration, TechnologyEvent, TechnologyFunction, TechnologyInteraction, TechnologyInterface, TechnologyProcess, TechnologyService, Triggering, Value, ValueStream, WorkPackage } from '../archimate-metamodel'

import { DocumentationHandler } from './Documentation'
import { ElementHandler } from './Element'
import { FolderHandler } from './Folder'
import { ModelHandler } from './Model'
import { PurposeHandler } from './Purpose'
import { RelationshipHandler } from './Relationship'

export const archimateHandlers: Record<
  `${string}Handler`,
  ArchimateMetamodelElement
> = {
  ModelHandler,
  ElementHandler,
  RelationshipHandler,
  FolderHandler,
  PurposeHandler,
  DocumentationHandler,
  ...createPassthroughHandlers([
    // Business layer elements
    BusinessActor,
    BusinessRole,
    BusinessCollaboration,
    BusinessInterface,
    BusinessProcess,
    BusinessFunction,
    BusinessInteraction,
    BusinessService,
    BusinessEvent,
    BusinessObject,
    Contract,
    Representation,
    Product,
    // Application layer elements
    ApplicationComponent,
    ApplicationCollaboration,
    ApplicationInterface,
    ApplicationProcess,
    ApplicationFunction,
    ApplicationInteraction,
    ApplicationService,
    ApplicationEvent,
    DataObject,
    // Technology layer elements
    Node,
    Device,
    SystemSoftware,
    TechnologyCollaboration,
    TechnologyInterface,
    TechnologyProcess,
    TechnologyFunction,
    TechnologyInteraction,
    TechnologyService,
    TechnologyEvent,
    Artifact,
    CommunicationNetwork,
    Path,
    // Physical layer elements
    Equipment,
    DistributionNetwork,
    Facility,
    Material,
    // Motivation layer elements
    Stakeholder,
    Driver,
    Assessment,
    Goal,
    Outcome,
    Principle,
    Requirement,
    Constraint,
    Value,
    Meaning,
    // Strategy layer elements
    Resource,
    Capability,
    ValueStream,
    CourseOfAction,
    // Implementation & Migration layer elements
    WorkPackage,
    ImplementationEvent,
    Deliverable,
    Plateau,
    Gap,
    // Other elements
    Location,
    Grouping,
    Junction,
    OrJunction,
    AndJunction,
    // Relationship elements
    Association,
    Realization,
    Serving,
    Flow,
    Aggregation,
    Influence,
    Composition,
    Triggering,
    Assignment,
    Specialization,
    Access,
  ]),
}

function createPassthroughHandlers(elements: ArchimateMetamodelElement[]) {
  const handlers: Record<string, ArchimateMetamodelElement> = {}
  Object.entries(elements).forEach(([key, element]) => {
    handlers[`${key}Handler`] = element.createPassthroughHandler()
  })
  return handlers
}
