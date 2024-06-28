import { Metamodel } from '@cm2ml/ir'

const Attributes = {
  id: 'id',
  name: 'name',
  type: 'type',
  'xsi:type': 'xsi:type',
  documentation: 'documentation',
  purpose: 'purpose',
  layer: 'layer',
  source: 'source',
  target: 'target',
} as const

export type ArchimateAttribute = keyof typeof Attributes

export type ArchimateTag = never

const AbstractTypes = {
  Element: 'Element',
  Relationship: 'Relationship',
} as const

export type ArchimateAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

const BusinessTypes = {
  BusinessActor: 'BusinessActor',
  BusinessRole: 'BusinessRole',
  BusinessCollaboration: 'BusinessCollaboration',
  BusinessInterface: 'BusinessInterface',
  BusinessProcess: 'BusinessProcess',
  BusinessFunction: 'BusinessFunction',
  BusinessInteraction: 'BusinessInteraction',
  BusinessService: 'BusinessService',
  BusinessEvent: 'BusinessEvent',
  BusinessObject: 'BusinessObject',
  Contract: 'Contract',
  Representation: 'Representation',
  Product: 'Product',
} as const

const ApplicationTypes = {
  ApplicationComponent: 'ApplicationComponent',
  ApplicationCollaboration: 'ApplicationCollaboration',
  ApplicationInterface: 'ApplicationInterface',
  ApplicationProcess: 'ApplicationProcess',
  ApplicationFunction: 'ApplicationFunction',
  ApplicationInteraction: 'ApplicationInteraction',
  ApplicationService: 'ApplicationService',
  ApplicationEvent: 'ApplicationEvent',
  DataObject: 'DataObject',
} as const

const TechnologyTypes = {
  Node: 'Node',
  Device: 'Device',
  SystemSoftware: 'SystemSoftware',
  TechnologyCollaboration: 'TechnologyCollaboration',
  TechnologyInterface: 'TechnologyInterface',
  TechnologyProcess: 'TechnologyProcess',
  TechnologyFunction: 'TechnologyFunction',
  TechnologyInteraction: 'TechnologyInteraction',
  TechnologyService: 'TechnologyService',
  TechnologyEvent: 'TechnologyEvent',
  Artifact: 'Artifact',
  CommunicationNetwork: 'CommunicationNetwork',
  Path: 'Path',
} as const

const PhysicalTypes = {
  Equipment: 'Equipment',
  DistributionNetwork: 'DistributionNetwork',
  Facility: 'Facility',
  Material: 'Material',
} as const

const MotivationTypes = {
  Stakeholder: 'Stakeholder',
  Driver: 'Driver',
  Assessment: 'Assessment',
  Goal: 'Goal',
  Outcome: 'Outcome',
  Principle: 'Principle',
  Requirement: 'Requirement',
  Constraint: 'Constraint',
  Value: 'Value',
  Meaning: 'Meaning',
} as const

const StrategyTypes = {
  Resource: 'Resource',
  Capability: 'Capability',
  ValueStream: 'ValueStream',
  CourseOfAction: 'CourseOfAction',
} as const

const ImplementationMigrationTypes = {
  WorkPackage: 'WorkPackage',
  ImplementationEvent: 'ImplementationEvent',
  Deliverable: 'Deliverable',
  Plateau: 'Plateau',
  Gap: 'Gap',
} as const

const OtherTypes = {
  Location: 'Location',
  Grouping: 'Grouping',
  Junction: 'Junction',
  OrJunction: 'OrJunction',
  AndJunction: 'AndJunction',
} as const

const layerTypes = {
  Business: { ...BusinessTypes },
  Application: { ...ApplicationTypes },
  Technology: { ...TechnologyTypes },
  Physical: { ...PhysicalTypes },
  Motivation: { ...MotivationTypes },
  Strategy: { ...StrategyTypes },
  Implementation_Migration: { ...ImplementationMigrationTypes },
  Other: { ...OtherTypes },
}

export const typeToLayerMap: Record<string, string> = {}

Object.entries(layerTypes).forEach(([layer, types]) => {
  Object.keys(types).forEach((type) => {
    typeToLayerMap[type] = layer
  })
})

const RelationshipTypes = {
  AssociationRelationship: 'AssociationRelationship',
  RealizationRelationship: 'RealizationRelationship',
  ServingRelationship: 'ServingRelationship',
  FlowRelationship: 'FlowRelationship',
  AggregationRelationship: 'AggregationRelationship',
  InfluenceRelationship: 'InfluenceRelationship',
  CompositionRelationship: 'CompositionRelationship',
  TriggeringRelationship: 'TriggeringRelationship',
  AssignmentRelationship: 'AssignmentRelationship',
  SpecializationRelationship: 'SpecializationRelationship',
  AccessRelationship: 'AccessRelationship',
  // TODO: handle Specialisation / Realisation (i.e., UK vs American English)
} as const

const Types = {
  model: 'model',
  ArchimateDiagramModel: 'ArchimateDiagramModel',
  DiagramObject: 'DiagramObject',
  ...BusinessTypes,
  ...ApplicationTypes,
  ...TechnologyTypes,
  ...PhysicalTypes,
  ...MotivationTypes,
  ...StrategyTypes,
  ...ImplementationMigrationTypes,
  ...OtherTypes,
  ...RelationshipTypes,
} as const

export type ArchimateType = (typeof Types)[keyof typeof Types]

export const Archimate = new class extends Metamodel<ArchimateAttribute, ArchimateType, ArchimateTag> {
  public readonly AbstractTypes = AbstractTypes
  public constructor() {
    super({
      Attributes,
      idAttribute: Attributes.id,
      Types,
      typeAttributes: [Attributes['xsi:type'], Attributes.type],
      Tags: {},
    })
  }
}()
