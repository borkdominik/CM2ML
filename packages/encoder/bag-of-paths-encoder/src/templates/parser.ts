import type { GraphNode, ModelMember } from '@cm2ml/ir'

import type { PathContextKey, ComparisonOperator, Condition, ConditionalTemplate, Keyword, Replacement, Selector, Template } from './model'
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
  .addOperation<ComparisonOperator>('parseComparisonOperator()', {
    ComparisonOperator(value) {
      return value.sourceString as ComparisonOperator
    },
  })
  .addOperation<PathContextKey>('parsePathKey()', {
    PathKey(value) {
      return value.sourceString as PathContextKey
    },
  })
  .addOperation<Selector<ModelMember>>('parsePathSelector()', {
    PathSelector(_, path) {
      const pathValue = path.parsePathKey()
      return (_node, context) => `${context[pathValue]}`
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
    NodeSelector_path(path) {
      return path.parsePathSelector()
    },
  })
  .addOperation<Replacement<GraphNode>>('parseNodeReplacement()', {
    NodeReplacement_selector(_, replacement, __) {
      const parsedSelector = replacement.parseNodeSelector()
      return (node, context) => {
        const replacementValue = parsedSelector(node, context)
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
    NodeCondition_comparison(selector, operator, literal) {
      const parsedSelector = selector.parseNodeSelector()
      const parsedOperator = operator.parseComparisonOperator()
      const parsedLiteral = literal.parseLiteralValue()
      return (node, context) => compareValues(parsedOperator, parsedSelector(node, context), parsedLiteral)
    },
    NodeCondition_exists(selector, _) {
      const parsedSelector = selector.parseNodeSelector()
      return (node, context) => parsedSelector(node, context) !== undefined
    },
  })
  .addOperation<Replacement<GraphNode>>('parseConditionalNodeReplacement()', {
    ConditionalNodeReplacement(_, condition, __, replacement, ___) {
      const parsedCondition = condition.parseNodeCondition()
      const parsedReplacement = replacement.asIteration().children.map((segment) => segment.parseNodeReplacement())
      return (node, context) => {
        return parsedCondition(node, context) ? parsedReplacement.map((replacement) => replacement(node, context)).join('') : ''
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
      const parsedSegments = segments.asIteration().children.map((segment) => ({ source: segment.source, segment: segment.parseNodeSegment() })).reverse()
      return (node, context) => {
        let result = segments.source.sourceString
        for (const { source, segment } of parsedSegments) {
          const { startIdx, endIdx } = source
          const replacementValue = segment(node, context)
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
      return (node, context) => {
        if (!parsedCondition(node, context)) {
          return undefined
        }
        return parsedTemplate(node, context)
      }
    },
  })

export function compileNodeTemplate(template: string): Template<GraphNode> {
  const matchResult = grammar.match(template, 'NodeTemplate')
  if (matchResult.succeeded()) {
    return semantics(matchResult).parseNodeTemplate()
  }
  throw new Error(matchResult.message ?? 'An unknown error occurred')
}

function compareValues(operator: ComparisonOperator, a: string | undefined, b: string): boolean {
  if (a === undefined) {
    return false
  }
  const aNumeric = Number(a)
  const bNumeric = Number(b)
  if (isNaN(aNumeric) || isNaN(bNumeric)) {
    return compareStringValues(operator, a, b)
  }
  return compareNumericValues(operator, aNumeric, bNumeric)
}

function compareNumericValues(operator: ComparisonOperator, a: number, b: number): boolean {
  switch (operator) {
    case '=':
      return a === b
    case '!=':
      return a !== b
    case '<':
      return a < b
    case '<=':
      return a <= b
    case '>':
      return a > b
    case '>=':
      return a >= b
    default:
      throw new Error(`Unknown operator: ${operator}. This is an internal error.`)
  }
}

function compareStringValues(operator: ComparisonOperator, a: string, b: string): boolean {
  const result = a.localeCompare(b)
  switch (operator) {
    case '=':
      return result === 0
    case '!=':
      return result !== 0
    case '<':
      return result < 0
    case '<=':
      return result <= 0
    case '>':
      return result > 0
    case '>=':
      return result >= 0
    default:
      throw new Error(`Unknown operator: ${operator}. This is an internal error.`)
  }
}
