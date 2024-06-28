import type { HandlerPropagation, MetamodelElement } from '@cm2ml/metamodel'
import { createMetamodel } from '@cm2ml/metamodel'

import type {
  ArchimateAbstractType,
  ArchimateAttribute,
  ArchimateTag,
  ArchimateType,
} from './archimate'
import { Archimate } from './archimate'

export interface ArchimateHandlerParameters extends HandlerPropagation {
  viewsAsNodes: boolean
  relationshipsAsNodes: boolean
}

export type ArchimateMetamodelElement = MetamodelElement<
  ArchimateAttribute,
  ArchimateType,
  ArchimateAbstractType,
  ArchimateTag,
  ArchimateHandlerParameters
>

const { define, defineAbstract } = createMetamodel<
  ArchimateAttribute,
  ArchimateType,
  ArchimateAbstractType,
  ArchimateTag,
  ArchimateHandlerParameters
>(Archimate)

// Model
export const Model = define(Archimate.Types.model, undefined)

// Abstract Types
export const Element = defineAbstract(Archimate.AbstractTypes.Element)
export const Relationship = defineAbstract(Archimate.AbstractTypes.Relationship)

// Business Types
export const BusinessActor = define(Archimate.Types.BusinessActor, undefined, Element)
export const BusinessRole = define(Archimate.Types.BusinessRole, undefined, Element)
export const BusinessCollaboration = define(Archimate.Types.BusinessCollaboration, undefined, Element)
export const BusinessInterface = define(Archimate.Types.BusinessInterface, undefined, Element)
export const BusinessProcess = define(Archimate.Types.BusinessProcess, undefined, Element)
export const BusinessFunction = define(Archimate.Types.BusinessFunction, undefined, Element)
export const BusinessInteraction = define(Archimate.Types.BusinessInteraction, undefined, Element)
export const BusinessService = define(Archimate.Types.BusinessService, undefined, Element)
export const BusinessEvent = define(Archimate.Types.BusinessEvent, undefined, Element)
export const BusinessObject = define(Archimate.Types.BusinessObject, undefined, Element)
export const Contract = define(Archimate.Types.Contract, undefined, Element)
export const Representation = define(Archimate.Types.Representation, undefined, Element)
export const Product = define(Archimate.Types.Product, undefined, Element)

// Application Types
export const ApplicationComponent = define(Archimate.Types.ApplicationComponent, undefined, Element)
export const ApplicationCollaboration = define(Archimate.Types.ApplicationCollaboration, undefined, Element)
export const ApplicationInterface = define(Archimate.Types.ApplicationInterface, undefined, Element)
export const ApplicationProcess = define(Archimate.Types.ApplicationProcess, undefined, Element)
export const ApplicationFunction = define(Archimate.Types.ApplicationFunction, undefined, Element)
export const ApplicationInteraction = define(Archimate.Types.ApplicationInteraction, undefined, Element)
export const ApplicationService = define(Archimate.Types.ApplicationService, undefined, Element)
export const ApplicationEvent = define(Archimate.Types.ApplicationEvent, undefined, Element)
export const DataObject = define(Archimate.Types.DataObject, undefined, Element)

// Technology Types
export const Node = define(Archimate.Types.Node, undefined, Element)
export const Device = define(Archimate.Types.Device, undefined, Element)
export const SystemSoftware = define(Archimate.Types.SystemSoftware, undefined, Element)
export const TechnologyCollaboration = define(Archimate.Types.TechnologyCollaboration, undefined, Element)
export const TechnologyInterface = define(Archimate.Types.TechnologyInterface, undefined, Element)
export const TechnologyProcess = define(Archimate.Types.TechnologyProcess, undefined, Element)
export const TechnologyFunction = define(Archimate.Types.TechnologyFunction, undefined, Element)
export const TechnologyInteraction = define(Archimate.Types.TechnologyInteraction, undefined, Element)
export const TechnologyService = define(Archimate.Types.TechnologyService, undefined, Element)
export const TechnologyEvent = define(Archimate.Types.TechnologyEvent, undefined, Element)
export const Artifact = define(Archimate.Types.Artifact, undefined, Element)
export const CommunicationNetwork = define(Archimate.Types.CommunicationNetwork, undefined, Element)
export const Path = define(Archimate.Types.Path, undefined, Element)

// Physical Types
export const Equipment = define(Archimate.Types.Equipment, undefined, Element)
export const DistributionNetwork = define(Archimate.Types.DistributionNetwork, undefined, Element)
export const Facility = define(Archimate.Types.Facility, undefined, Element)
export const Material = define(Archimate.Types.Material, undefined, Element)

// Motivation Types
export const Stakeholder = define(Archimate.Types.Stakeholder, undefined, Element)
export const Driver = define(Archimate.Types.Driver, undefined, Element)
export const Assessment = define(Archimate.Types.Assessment, undefined, Element)
export const Goal = define(Archimate.Types.Goal, undefined, Element)
export const Outcome = define(Archimate.Types.Outcome, undefined, Element)
export const Principle = define(Archimate.Types.Principle, undefined, Element)
export const Requirement = define(Archimate.Types.Requirement, undefined, Element)
export const Constraint = define(Archimate.Types.Constraint, undefined, Element)
export const Value = define(Archimate.Types.Value, undefined, Element)
export const Meaning = define(Archimate.Types.Meaning, undefined, Element)

// Strategy Types
export const Resource = define(Archimate.Types.Resource, undefined, Element)
export const Capability = define(Archimate.Types.Capability, undefined, Element)
export const ValueStream = define(Archimate.Types.ValueStream, undefined, Element)
export const CourseOfAction = define(Archimate.Types.CourseOfAction, undefined, Element)

// Implementation & Migration Types
export const WorkPackage = define(Archimate.Types.WorkPackage, undefined, Element)
export const ImplementationEvent = define(Archimate.Types.ImplementationEvent, undefined, Element)
export const Deliverable = define(Archimate.Types.Deliverable, undefined, Element)
export const Plateau = define(Archimate.Types.Plateau, undefined, Element)
export const Gap = define(Archimate.Types.Gap, undefined, Element)

// Other Types
export const Location = define(Archimate.Types.Location, undefined, Element)
export const Grouping = define(Archimate.Types.Grouping, undefined, Element)
export const Junction = define(Archimate.Types.Junction, undefined, Element)
export const OrJunction = define(Archimate.Types.OrJunction, undefined, Element)
export const AndJunction = define(Archimate.Types.AndJunction, undefined, Element)

// Relationship Types
export const Association = define(Archimate.Types.AssociationRelationship, undefined, Relationship)
export const Realization = define(Archimate.Types.RealizationRelationship, undefined, Relationship)
export const Serving = define(Archimate.Types.ServingRelationship, undefined, Relationship)
export const Flow = define(Archimate.Types.FlowRelationship, undefined, Relationship)
export const Aggregation = define(Archimate.Types.AggregationRelationship, undefined, Relationship)
export const Composition = define(Archimate.Types.CompositionRelationship, undefined, Relationship)
export const Influence = define(Archimate.Types.InfluenceRelationship, undefined, Relationship)
export const Triggering = define(Archimate.Types.TriggeringRelationship, undefined, Relationship)
export const Assignment = define(Archimate.Types.AssignmentRelationship, undefined, Relationship)
export const Specialization = define(Archimate.Types.SpecializationRelationship, undefined, Relationship)
export const Access = define(Archimate.Types.AccessRelationship, undefined, Relationship)

// Views
export const ArchimateDiagramModel = define(Archimate.Types.ArchimateDiagramModel, undefined)
export const DiagramObject = define(Archimate.Types.DiagramObject, undefined)
