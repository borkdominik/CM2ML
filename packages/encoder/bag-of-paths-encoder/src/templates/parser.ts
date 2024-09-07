import type { GraphNode } from '@cm2ml/ir'

import type { Condition, ConditionalTemplate, ConditionOperator, Keyword, Replacement, Selector, Template } from './model'
import grammar from './template.ohm-bundle'
import type { TemplateSemantics } from './template.ohm-bundle'

const semantics: TemplateSemantics = grammar
  .createSemantics()
  .addOperation<string>('parseAttributeName()', {
    AttributeName(name) {
      return name.sourceString
    },
  })
  .addOperation<string>('parseAttributeSelector()', {
    AttributeSelector(_, attribute) {
      return attribute.parseAttributeName()
    },
  })
  .addOperation<Keyword>('parseKeyword()', {
    Keyword(value) {
      return value.sourceString as Keyword
    },
  })
  .addOperation<ConditionOperator>('parseConditionOperator()', {
    ConditionOperator(value) {
      return value.sourceString as ConditionOperator
    },
  })
  .addOperation<Selector<GraphNode>>('parseNodeSelector()', {
    NodeSelector_attribute(attribute) {
      const parsedAttribute = attribute.parseAttributeSelector()
      return (node) => node.attributes.get(parsedAttribute)?.value.literal
    },
    NodeSelector_keyword(keyword) {
      const parsedKeyword = keyword.parseKeyword()
      return (node) => node[parsedKeyword]
    },
  })
  .addOperation<Replacement<GraphNode>>('parseNodeReplacement()', {
    NodeReplacement_selector(_, replacement, __) {
      const parsedReplacement = replacement.parseNodeSelector()
      return (node) => {
        const replacementValue = parsedReplacement(node)
        return replacementValue ?? ''
      }
    },
    NodeReplacement_literal(replacement) {
      const replacementValue = replacement.parseLiteralValue()
      return (_node) => {
        return replacementValue ?? ''
      }
    },
  })
  .addOperation<string>('parseLiteralValue()', {
    LiteralValue(value) {
      return value.sourceString
    },
  })
  .addOperation<Condition<GraphNode>>('parseNodeCondition()', {
    NodeCondition(selector, operator, target) {
      const parsedSelector = selector.parseNodeSelector()
      const parsedOperator = operator.parseConditionOperator()
      const parsedTarget = target.parseLiteralValue()
      return (node) => {
        const value = parsedSelector(node)
        if (parsedOperator === '=') {
          return value === parsedTarget
        }
        if (parsedOperator === '!=') {
          return value !== parsedTarget
        }
        throw new Error(`Unknown operator: ${parsedOperator}. This is an internal error.`)
      }
    },
  })
  .addOperation<Replacement<GraphNode>>('parseConditionalNodeReplacement()', {
    ConditionalNodeReplacement(_, condition, __, replacement, ___) {
      const parsedCondition = condition.parseNodeCondition()
      const parsedReplacement = replacement.parseNodeReplacement()
      return (node, partialReplacement) => {
        return parsedCondition(node) ? parsedReplacement(node, partialReplacement) : ''
      }
    },
  })
  .addOperation<Replacement<GraphNode>>('parseNodeSegment()', {
    NodeSegment_replacement(replacement) {
      return replacement.parseNodeReplacement()
    },
    NodeSegment_conditionalReplacement(conditionalReplacement) {
      return conditionalReplacement.parseConditionalNodeReplacement()
    },
  })
  .addOperation<Template<GraphNode>>('parseNodeTemplateBase()', {
    NodeTemplateBase(segments) {
      // Reverse direction to not change the indices when applying the replacements
      const parsedSegments = segments.asIteration().children.map((segment) => ({ source: segment.source, parsed: segment.parseNodeSegment() })).reverse()
      return (node) => {
        let result = segments.source.sourceString
        for (const { source, parsed } of parsedSegments) {
          const { startIdx, endIdx } = source
          const replacementValue = parsed(node, result)
          result = `${result.slice(0, startIdx)}${replacementValue}${result.slice(endIdx)}`
        }
        return result.slice(segments.source.startIdx)
      }
    },
  })
  .addOperation<Template<GraphNode> | ConditionalTemplate<GraphNode>>('parseNodeTemplate()', {
    NodeTemplate_template(template) {
      return template.parseNodeTemplateBase()
    },
    NodeTemplate_conditionalTemplate(_, condition, __, template) {
      const parsedCondition = condition.parseNodeCondition()
      const parsedTemplate = template.parseNodeTemplateBase()
      return (node) => {
        if (!parsedCondition(node)) {
          return undefined
        }
        const applied = parsedTemplate(node)
        return applied
      }
    },
  })
export function compileTemplate(formula: string): Template<GraphNode> {
  const matchResult = grammar.match(formula, 'NodeTemplate')
  if (matchResult.succeeded()) {
    return semantics(matchResult).parseNodeTemplate()
  }
  throw new Error(matchResult.message ?? 'An unknown error occurred')
}
