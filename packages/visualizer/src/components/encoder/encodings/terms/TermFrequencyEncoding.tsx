import { TermFrequencyEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { Button } from '../../../ui/button'
import { Hint } from '../../../ui/hint'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TermFrequencyEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TermFrequencyEncoder, model, parameters)
  const setSelection = useSelection.use.setSelection()
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  if (error || !encoding) {
    return <Hint error={error} />
  }
  // const { termDocumentMatrix, termList } = encoding.metadata
  const { termDocumentMatrix, termList, modelIds } = encoding.metadata
  const modelTerms = encoding.data.modelTerms?.[0]

  const handleTermClick = (term: string) => {
    if (modelTerms) {
      const node = modelTerms.terms.find((node) => node.name === term)
      if (node) {
        setSelectedTerm(term)
        setSelection({ type: 'nodes', nodes: [node.nodeId], origin: 'graph' })
      }
    }
  }

  return (
    <div className="max-h-full overflow-y-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Term Frequency Encoding</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Term</TableHead>
              {modelIds.map((modelId: string) => (
                <TableHead key={modelId} className="border px-4 py-2">{modelId}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {termList.map((term: string, index: number) => (
              <TableRow key={term}>
                <TableCell className="border px-4 py-2">
                  <Button
                    variant="ghost"
                    className={`w-full text-left ${term === selectedTerm ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleTermClick(term)}
                  >
                    {term}
                  </Button>
                </TableCell>
                {modelIds.map((modelId: string) => (
                  <TableCell key={modelId} className="border px-4 py-2 text-center">
                    {termDocumentMatrix[modelId][index]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
