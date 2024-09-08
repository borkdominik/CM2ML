import type { GraphNode, ModelMember } from '@cm2ml/ir'

import type { Condition, ComparisonOperator, ConditionalTemplate, Keyword, Replacement, Selector, Template, PathContextKey } from './model'

declare module 'ohm-js' {
  interface Node {
    parseAttribute: () => string
    parseAttributeName: () => string
    parseAttributeSelector: () => string
    parseComparisonOperator: () => ComparisonOperator
    parseConditionalNodeReplacement: () => Replacement<GraphNode>
    parseKeyword: () => Keyword
    parseLiteralValue: () => string
    parseNodeCondition: () => Condition<GraphNode>
    parseNodeReplacement: () => Replacement<GraphNode>
    parseNodeSegment: () => Replacement<GraphNode>
    parseNodeSelector: () => Selector<GraphNode>
    parseNodeTemplate: () => Template<GraphNode> | ConditionalTemplate<GraphNode>
    parseNodeTemplateBase: () => Template<GraphNode>
    parsePathSelector: () => Selector<ModelMember>
    parsePathKey: () => PathContextKey
  }

  interface Dict {
    parseNodeTemplate: () => Template<GraphNode>
  }
}
