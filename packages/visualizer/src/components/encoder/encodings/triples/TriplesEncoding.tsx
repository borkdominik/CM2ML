import { TriplesEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect, useState } from 'react'

import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { Button } from '../../../ui/button'
import { Hint } from '../../../ui/hint'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TriplesEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TriplesEncoder, model, parameters)
  const setSelection = useSelection.use.setSelection()
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [updatedTriples, setUpdatedTriples] = useState<any[]>([])
  const [serverUnavailable, setServerUnavailable] = useState(false)

  useEffect(() => {
    const checkServer = async () => {
      try {
        const ping = await fetch('http://localhost:8080/health')
        if (!ping.ok) {
          setServerUnavailable(true)
        }
      } catch {
        setServerUnavailable(true)
      }
    }

    checkServer()
  }, [])

  useEffect(() => {
    if (!parameters.useWordEmbeddings) {
      return
    }

    const fetchEmbeddings = async () => {
      const triples = encoding?.metadata[0]?.triples
      if (!triples) {
        return
      }

      const embeddingsModel = parameters.embeddingsModel?.toString() ?? 'glove-mde'
      const strategy = parameters.combineWordsStrategy as string

      const fetchEmbedding = async (term: string): Promise<number[] | null> => {
        const words = term.split(/\s+/)
        const embeddings: number[][] = []

        for (const word of words) {
          try {
            const response = await fetch(`http://localhost:8080/embedding/${embeddingsModel}/${encodeURIComponent(word.toLowerCase())}`)
            if (response.ok) {
              const data = await response.json()
              embeddings.push(data.embedding)
            } else if (response.status === 404 && parameters.oovStrategy === 'most-similar') {
              const response = await fetch(`http://localhost:8080/embedding/${embeddingsModel}/${encodeURIComponent(word)}/similar`)
              if (response.ok) {
                const data = await response.json()
                embeddings.push(data.embedding)
              }
            } else if (response.status === 404 && parameters.oovStrategy === 'zero') {
              // TODO: zero vector (dimension? glove/word2vec might not be same)
              // TODO: also implement random & discard
            }
          } catch (err) {
            console.error(`Error fetching embedding for word: ${word}`, err)
          }
        }

        if (embeddings.length === 0) {
          return null
        }
        if (strategy === 'skip') {
          return words.length > 1 ? null : embeddings[0]!
        } else if (strategy === 'first') {
          return embeddings[0]!
        } else if (strategy === 'concat') {
          return embeddings.flat()
        } else if (strategy === 'average') {
          const dim = embeddings[0]!.length
          const avg = Array.from({ length: dim }, () => 0)
          for (const vec of embeddings) {
            for (let i = 0; i < dim; i++) {
              avg[i]! += vec[i]!
            }
          }
          return avg.map((v) => v / embeddings.length)
        }

        return null
      }

      const enrichedTriples = await Promise.all(triples.map(async (triple: any) => {
        const [sourceEmbedding, targetEmbedding] = await Promise.all([
          fetchEmbedding(triple.sourceName),
          fetchEmbedding(triple.targetName),
        ])
        return { ...triple, sourceEmbedding, targetEmbedding }
      }))

      setUpdatedTriples(enrichedTriples)
    }

    fetchEmbeddings()
  }, [encoding])

  if (error || !encoding) {
    return <Hint error={error} />
  }

  const handleTripleClick = (sourceId?: string) => {
    if (!sourceId) {
      return
    }
    setSelectedSourceId(sourceId)
    setSelection({ type: 'nodes', nodes: [sourceId], origin: 'graph' })
  }

  const truncateEmbedding = (embedding: number[] | undefined, maxDims: number = 5) => {
    if (!embedding) {
      return ''
    }
    return embedding.slice(0, maxDims).map((v) => v.toFixed(2)).join(', ')
  }

  const triples = updatedTriples.length > 0
    ? updatedTriples
    : encoding?.metadata?.[0]?.triples ?? []

  return (
    <div className="max-h-full overflow-y-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Triples Encoding</h2>
      {(serverUnavailable && parameters.useWordEmbeddings) && (
        <div className="mb-4 rounded border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-800">
          ⚠️ Embedding server is not available. Showing fallback embeddings from cache or original input.
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Name</TableHead>
              {parameters.includeTypes && <TableHead>Source Type</TableHead>}
              <TableHead>Relationship</TableHead>
              {parameters.includeTypes && <TableHead>Target Type</TableHead>}
              <TableHead>Target Name</TableHead>
              {parameters.useWordEmbeddings && <TableHead>Source Embedding</TableHead>}
              {parameters.useWordEmbeddings && <TableHead>Target Embedding</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {triples.map((triple) => (
              <TableRow key={`${triple.sourceId}-${triple.targetName}`}>
                <TableCell className="border px-4 py-2">
                  <Button
                    variant="ghost"
                    className={`w-full text-left ${triple.sourceId === selectedSourceId ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleTripleClick(triple.sourceId)}
                  >
                    {triple.sourceName}
                  </Button>
                </TableCell>
                {parameters.includeTypes && (
                  <TableCell className="border px-4 py-2">
                    {parameters.typesAsNumber
                      ? (triple.sourceType as number)
                      : parameters.typesAsOneHot
                        ? (triple.sourceType as number[]).join(', ')
                        : triple.sourceType}
                  </TableCell>
                )}
                <TableCell className="border px-4 py-2">
                  {parameters.typesAsNumber
                    ? (triple.relationshipType as number)
                    : parameters.typesAsOneHot
                      ? (triple.relationshipType as number[]).join(', ')
                      : triple.relationshipType}
                </TableCell>
                {parameters.includeTypes && (
                  <TableCell className="border px-4 py-2">
                    {parameters.typesAsNumber
                      ? (triple.targetType as number)
                      : parameters.typesAsOneHot
                        ? (triple.targetType as number[]).join(', ')
                        : triple.targetType}
                  </TableCell>
                )}
                <TableCell className="border px-4 py-2">{triple.targetName}</TableCell>
                {parameters.useWordEmbeddings && (
                  <TableCell className="border px-4 py-2 font-mono text-sm">
                    {truncateEmbedding(triple.sourceEmbedding)}
                    , ...
                  </TableCell>
                )}
                {parameters.useWordEmbeddings && (
                  <TableCell className="border px-4 py-2 font-mono text-sm">
                    {truncateEmbedding(triple.targetEmbedding)}
                    , ...
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
