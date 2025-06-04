import { BagOfWordsEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { Button } from '../../../ui/button'
import { Card, CardContent } from '../../../ui/card'
import { Hint } from '../../../ui/hint'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function BagOfWordsEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(BagOfWordsEncoder, model, parameters)
  const setSelection = useSelection.use.setSelection()
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (!parameters.includeNodeIds) {
    return <Hint error={new Error('Parameter \'includeNodeIds\' has to be enabled for visualization.')} />
  }

  const modelTerms = encoding.metadata || []

  const handleTermClick = (term: string, nodeId: string) => {
    setSelectedTerm(term)
    setSelection({ type: 'nodes', nodes: [nodeId], origin: 'graph' })
  }

  const formatModelLabel = (modelId: string) => {
    const viewId = modelId.split('--__--')[1]
    return viewId ? `${viewId.slice(0, 8)}…` : `${modelId.slice(0, 8)}…`
  }

  return (
    <Card className="mx-auto max-w-5xl p-4">
      <CardContent>
        <h2 className="mb-4 text-lg font-semibold">Bag of Words Encoding</h2>
        <Tabs defaultValue={modelTerms[0]?.modelId} className="w-full">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Views</div>
          <TabsList className="mb-4 flex flex-wrap gap-2 overflow-x-auto">
            {modelTerms.map(({ modelId }) => (
              <TabsTrigger key={modelId} value={modelId} title={modelId} className="max-w-[160px] truncate">
                {formatModelLabel(modelId)}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mb-1 text-sm font-medium text-muted-foreground">
            {parameters.encodeAsSentence ? 'Sentences' : 'Words'}
          </div>
          {modelTerms.map(({ modelId, terms }) => (
            <TabsContent key={modelId} value={modelId}>
              <div className="grid max-h-96 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 overflow-y-auto">
                {terms.map((term) => (
                  <Button
                    key={`${modelId}-${term.name}-${term.nodeId}`}
                    variant="outline"
                    className={`h-auto min-h-12 w-full whitespace-normal break-words px-3 py-2 text-left text-sm leading-snug ${term.name === selectedTerm ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleTermClick(term.name, term.nodeId!)}
                  >
                    {term.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
