import { Metamodel } from '@cm2ml/ir'

const Attributes = [
  'id',
  'name',
  'type',
  'version',
  'xsi:type',
  'documentation',
  'purpose',
  'layer',
  'source',
  'target',
] as const

export type ArchimateAttribute = (typeof Attributes)[number]

export type ArchimateTag = never

const AbstractTypes = {
  Element: 'Element',
  Relationship: 'Relationship',
} as const

export type ArchimateAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

const BusinessTypes = [
  'BusinessActor',
  'BusinessRole',
  'BusinessCollaboration',
  'BusinessInterface',
  'BusinessProcess',
  'BusinessFunction',
  'BusinessInteraction',
  'BusinessService',
  'BusinessEvent',
  'BusinessObject',
  'Contract',
  'Representation',
  'Product',
] as const

const ApplicationTypes = [
  'ApplicationComponent',
  'ApplicationCollaboration',
  'ApplicationInterface',
  'ApplicationProcess',
  'ApplicationFunction',
  'ApplicationInteraction',
  'ApplicationService',
  'ApplicationEvent',
  'DataObject',
] as const

const TechnologyTypes = [
  'Node',
  'Device',
  'SystemSoftware',
  'TechnologyCollaboration',
  'TechnologyInterface',
  'TechnologyProcess',
  'TechnologyFunction',
  'TechnologyInteraction',
  'TechnologyService',
  'TechnologyEvent',
  'Artifact',
  'CommunicationNetwork',
  'Path',
] as const

const PhysicalTypes = [
  'Equipment',
  'DistributionNetwork',
  'Facility',
  'Material',
] as const

const MotivationTypes = [
  'Stakeholder',
  'Driver',
  'Assessment',
  'Goal',
  'Outcome',
  'Principle',
  'Requirement',
  'Constraint',
  'Value',
  'Meaning',
] as const

const StrategyTypes = [
  'Resource',
  'Capability',
  'ValueStream',
  'CourseOfAction',
] as const

const ImplementationMigrationTypes = [
  'WorkPackage',
  'ImplementationEvent',
  'Deliverable',
  'Plateau',
  'Gap',
] as const

const OtherTypes = [
  'Location',
  'Grouping',
  'Junction',
  'OrJunction',
  'AndJunction',
] as const

const layerTypes = {
  Business: BusinessTypes,
  Application: ApplicationTypes,
  Technology: TechnologyTypes,
  Physical: PhysicalTypes,
  Motivation: MotivationTypes,
  Strategy: StrategyTypes,
  Implementation_Migration: ImplementationMigrationTypes,
  Other: OtherTypes,
}

export const typeToLayerMap: Record<string, string> = {}
for (const [layer, types] of Object.entries(layerTypes)) {
  types.forEach((type) => {
    typeToLayerMap[type] = layer
  })
}

const RelationshipTypes = [
  'AssociationRelationship',
  'RealizationRelationship',
  'ServingRelationship',
  'FlowRelationship',
  'AggregationRelationship',
  'InfluenceRelationship',
  'CompositionRelationship',
  'TriggeringRelationship',
  'AssignmentRelationship',
  'SpecializationRelationship',
  'AccessRelationship',
] as const

const Types = [
  'model',
  'ArchimateDiagramModel',
  'DiagramObject',
  ...BusinessTypes,
  ...ApplicationTypes,
  ...TechnologyTypes,
  ...PhysicalTypes,
  ...MotivationTypes,
  ...StrategyTypes,
  ...ImplementationMigrationTypes,
  ...OtherTypes,
  ...RelationshipTypes,
] as const

export type ArchimateType = (typeof Types)[number]

export const Archimate = new class extends Metamodel<ArchimateAttribute, ArchimateType, ArchimateTag> {
  public readonly AbstractTypes = AbstractTypes
  public constructor() {
    super({
      attributes: Attributes,
      idAttribute: 'id',
      types: Types,
      typeAttributes: ['xsi:type', 'type'],
      tags: [],
    })
  }
}()
