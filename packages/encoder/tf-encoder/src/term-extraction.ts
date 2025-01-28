import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { stemmer } from 'stemmer'

import type { BiGramTermType, EncoderParameters } from './encoder'

export interface ExtractedTerm {
    nodeId: string
    name: string
    occurences: number
}

export interface ModelTerms {
    modelId: string
    terms: ExtractedTerm[]
}

export function extractModelTerms(models: GraphModel[], parameters: EncoderParameters): ModelTerms[] {
    return models.map((model) => {
        if (model.root.id === undefined) {
            throw new Error('Model ID is undefined')
        }
        return {
            modelId: model.root.id,
            terms: extractTerms(model, parameters),
        }
    })
}

function extractTerms(model: GraphModel, parameters: EncoderParameters): ExtractedTerm[] {
    const termMap = new Map<string, ExtractedTerm>()

    for (const node of model.nodes) {
        if (parameters.bigramEnabled) {
            const firstTerm = getTermValue(node, parameters.bigramFirstTerm, parameters.bigramFirstTermAttribute)
            const secondTerm = getTermValue(node, parameters.bigramSecondTerm, parameters.bigramSecondTermAttribute)

            if (firstTerm && secondTerm) {
                const bigram = `${firstTerm}${parameters.bigramSeparator}${secondTerm}`
                updateOrAddTerm(termMap, node.id!, bigram)
            }
        } else {
            // process names
            const name = node.getAttribute('name')?.value.literal
            if (parameters.namesAsTerms && name) {
                processTerms(termMap, node.id!, name, parameters)
            }

            // process types (do not tokenize)
            if (parameters.typesAsTerms && node.type) {
                updateOrAddTerm(termMap, node.id!, node.type)
            }

            // process additional attributes
            for (const attr of parameters.attributesAsTerms) {
                const attrValue = node.getAttribute(attr)?.value.literal
                if (attrValue) {
                    processTerms(termMap, node.id!, attrValue, parameters)
                }
            }
        }
    }
    
    return Array.from(termMap.values())
}

function processTerms(termMap: Map<string, ExtractedTerm>, nodeId: string, value: string, parameters: EncoderParameters) {
    const terms = parameters.tokenize ? tokenize(value) : [value]
    const stopWords = new Set(parameters.stopWords)

    terms.forEach((term: string) => {
        const processedTerm = parameters.stem ? stemmer(term) : term
        if (!stopWords.has(processedTerm)) {
            updateOrAddTerm(termMap, nodeId, processedTerm)
        }
    })
}

function updateOrAddTerm(termMap: Map<string, ExtractedTerm>, nodeId: string, termName: string) {
    if (termMap.has(termName)) {
        const term = termMap.get(termName)!
        term.occurences++
    } else {
        termMap.set(termName, { nodeId, name: termName, occurences: 1 })
    }
}

function tokenize(text: string): string[] {
    // split text into words, considering spaces and punctuation as separators
    const rawTokens = text.split(/[\s\p{P}]+/u)
    // convert to lowercase and remove empty characters
    return rawTokens
        .map((token) => token.toLowerCase().replace(/\W+/g, ''))
        .filter((token) => token.length > 0)
}

function getTermValue(
    node: GraphNode,
    termType: BiGramTermType,
    attributeName: string
): string | undefined {
    if (termType === 'name') {
        return node.getAttribute('name')?.value.literal
    } else if (termType === 'type') {
        return node.type
    } else if (termType === 'attribute') {
        return node.getAttribute(attributeName)?.value.literal
    }
    return undefined
}
