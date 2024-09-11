import type { GraphEdge, GraphNode, ModelMember } from '@cm2ml/ir'

import type {
  Condition,
  ComparisonOperator,
  ConditionalTemplate,
  Replacement,
  Selector,
  Template,
  PathContextKey,
  EdgeKeyword,
  NodeKeyword,
  StepWeighting,
} from './model'

declare module 'ohm-js' {
  interface Node {
    parseAttribute: () => string
    parseAttributeName: () => string
    parseAttributeSelector: () => string
    parseComparisonOperator: () => ComparisonOperator
    parseConditionalEdgeReplacement: () => Replacement<GraphEdge>
    parseConditionalNodeReplacement: () => Replacement<GraphNode>
    parseEdgeCondition: () => Condition<GraphEdge>
    parseEdgeKeyword: () => EdgeKeyword
    parseEdgeReplacement: () => Replacement<GraphEdge>
    parseEdgeSegment: () => Replacement<GraphEdge>
    parseEdgeSelector: () => Selector<GraphEdge>
    parseEdgeTemplate: () => Template<GraphEdge> | ConditionalTemplate<GraphEdge>
    parseEdgeTemplateBase: () => Template<GraphEdge>
    parseLiteralValue: () => string
    parseNodeCondition: () => Condition<GraphNode>
    parseNodeKeyword: () => NodeKeyword
    parseNodeReplacement: () => Replacement<GraphNode>
    parseNodeSegment: () => Replacement<GraphNode>
    parseNodeSelector: () => Selector<GraphNode>
    parseNodeTemplate: () => Template<GraphNode> | ConditionalTemplate<GraphNode>
    parseNodeTemplateBase: () => Template<GraphNode>
    parseNumber: () => number
    parsePathSelector: () => Selector<ModelMember>
    parsePathKey: () => PathContextKey
    parseStepWeighting: () => StepWeighting
  }

  interface Dict {
    parseEdgeTemplate: () => Template<GraphEdge>
    parseNodeTemplate: () => Template<GraphNode>
    parseStepWeighting: () => StepWeighting
  }
}
