import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { ModelTerms2, Term } from './term-extraction'
import { expandContainedNodesWithRelations } from './term-extraction'

export interface BiGramParameters {
  bigramSeparator: string
  bigramFirstTerm: BiGramTermType
  bigramFirstTermAttribute: string
  bigramSecondTerm: BiGramTermType
  bigramSecondTermAttribute: string

  separateViews: boolean
}

export const biGramTermTypes = ['name', 'type', 'attribute'] as const
export type BiGramTermType = typeof biGramTermTypes[number] | string & Record<never, never>

export function extractBiGrams(models: GraphModel[], params: BiGramParameters): ModelTerms2[] {
  return models.flatMap((model) => {
    if (!model.root.id) {
      throw new Error('Model ID is undefined')
    }
    const modelId = model.root.id

    if (params.separateViews) {
      const views = Stream.from(model.nodes).filter((n) => n.type === 'ArchimateDiagramModel').toArray()
      if (views.length === 0) {
        throw new Error('No View elements found! Enable \'viewsAsNodes\' when using \'separateViewIds\'')
      }

      return views.map((view) => {
        const containedNodes = Stream.from(view.outgoingEdges).map((e) => e.target).toArray()
        expandContainedNodesWithRelations(containedNodes)

        const terms: Term[] = containedNodes.flatMap((node) => {
          const first = getBiGramTerm(node, params.bigramFirstTerm, params.bigramFirstTermAttribute)
          const second = getBiGramTerm(node, params.bigramSecondTerm, params.bigramSecondTermAttribute)
          if (first && second) {
            return [{ nodeId: node.id!, name: `${first}${params.bigramSeparator}${second}` }]
          }
          return []
        })

        return { modelId: `${modelId}--__--${view.id}`, terms }
      })
    } else {
      const terms: Term[] = []
      for (const node of model.nodes) {
        const first = getBiGramTerm(node, params.bigramFirstTerm, params.bigramFirstTermAttribute)
        const second = getBiGramTerm(node, params.bigramSecondTerm, params.bigramSecondTermAttribute)
        if (first && second) {
          terms.push({ nodeId: node.id!, name: `${first}${params.bigramSeparator}${second}` })
        }
      }

      return [{ modelId, terms }]
    }
  })
}

function getBiGramTerm(node: GraphNode, type: BiGramTermType, attribute: string): string | undefined {
  if (type === 'name') {
    return node.getAttribute('name')?.value.literal
  }
  if (type === 'type') {
    return node.type
  }
  if (type === 'attribute') {
    return node.getAttribute(attribute)?.value.literal
  }
  return undefined
}

// BACKUP
/*
export function extractBiGrams(models: GraphModel[], params: BiGramParameters): ModelTerms2[] {
    return models.map(model => {
        if (!model.root.id) throw new Error('Model ID is undefined');
        const terms: Term[] = [];

        for (const node of model.nodes) {
            const first = getBiGramTerm(node, params.bigramFirstTerm, params.bigramFirstTermAttribute);
            const second = getBiGramTerm(node, params.bigramSecondTerm, params.bigramSecondTermAttribute);
            if (first && second) {
                const name = `${first}${params.bigramSeparator}${second}`;
                terms.push({ nodeId: node.id!, name });
            }
        }

        return { modelId: model.root.id, terms };
    });
}
*/
