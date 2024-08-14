import type { NodeEncoding, NodeEncodingType } from '@cm2ml/builtin'
import { BagOfPathsEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { Fragment, useMemo } from 'react'

import { displayName } from '../../../../lib/displayName'
import type { Selection } from '../../../../lib/useSelection'
import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { SelectButton } from '../../../SelectButton'
import { Hint } from '../../../ui/hint'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../ui/resizable'
import { Separator } from '../../../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs'
import { useEncoder } from '../../useEncoder'

import { PathGraph } from './PathGraph'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function BagOfPathsEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(BagOfPathsEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.data instanceof ExecutionError) {
    return <Hint error={encoding.data} />
  }
  const { paths, mapping, nodes } = encoding.data
  if (paths.length === 0) {
    return <Hint text="No paths found. Consider decreasing the minimum path length." />
  }
  const pathGraphList = (
    <div className="flex h-full flex-col overflow-y-auto">
      {paths.map((path, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {i > 0 ? <Separator /> : null}
          <PathGraph path={path} mapping={mapping} model={model} />
        </Fragment>
      ))}
    </div>
  )
  if (nodes.length === 0 || Object.values(nodes[0]!).every((encoding) => encoding === undefined)) {
    return pathGraphList
  }
  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel>
        {pathGraphList}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <NodeEncodings nodes={nodes} mapping={mapping} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface NodeEncodingsProps {
  nodes: NodeEncoding[]
  mapping: string[]
}

function NodeEncodings({ nodes, mapping }: NodeEncodingsProps) {
  const encodingTypes = useMemo(() => Stream.fromObject(nodes[0] ?? {}).filter((encoding) => encoding[1] !== undefined).map(([name]) => name).toArray() as NodeEncodingType[], [nodes])
  return (
    <Tabs defaultValue={encodingTypes[0]} className="flex size-full flex-col">
      {encodingTypes.length > 1
        ? (
            <div className="w-full shrink-0 overflow-x-auto">
              <TabsList className="w-full min-w-fit rounded-none">
                {encodingTypes.map((encodingType) =>
                  <TabsTrigger key={encodingType} value={encodingType}>{displayName(encodingType)}</TabsTrigger>,
                )}
              </TabsList>
            </div>
          )
        : null}
      {encodingTypes.map((encodingType) => (
        <TabsContent key={encodingType} value={encodingType} className="mt-0 grow overflow-auto">
          <NodeEncodingList encodingType={encodingType} nodes={nodes} mapping={mapping} />
        </TabsContent>
      ),
      )}
    </Tabs>
  )
}

interface NodeEncodingListProps {
  encodingType: NodeEncodingType
  nodes: NodeEncoding[]
  mapping: string[]
}

function NodeEncodingList({ encodingType, nodes, mapping }: NodeEncodingListProps) {
  const formattedVectors = useMemo(() => {
    const firstRow = nodes[0]?.[encodingType]
    if (!firstRow) {
      return []
    }
    const vectorLength = firstRow.length
    const maxDigits = Array.from({ length: vectorLength }, (_, i) =>
      Math.max(...nodes.map((node) => `${node[encodingType]![i]!}`.length)))
    return nodes.map((vectors, nodeIndex) => {
      const nodeId = mapping[nodeIndex]!
      const paddedVector = vectors[encodingType]!.map((value, i) => `${value}`.padStart(maxDigits[i]!, ' '))
      return {
        nodeId,
        vector: `[${paddedVector.join(', ')}]`,
      }
    })
  }, [encodingType, nodes])

  return (
    <div className="grid grid-cols-[min-content_1fr] gap-x-6 gap-y-2 p-2 text-xs">
      {formattedVectors.map(({ nodeId, vector }) => <NodeEncodingRow key={nodeId} nodeId={nodeId} vector={vector} />)}
    </div>
  )
}

interface NodeEncodingRowProps {
  nodeId: string
  vector: string
}

function NodeEncodingRow({ nodeId, vector }: NodeEncodingRowProps) {
  const selection = useSelection.use.selection()
  const isNodeSelected = useMemo(() => {
    if (!selection) {
      return false
    }
    if (selection.type === 'nodes') {
      return selection.nodes.includes(nodeId)
    }
    return selection.edges.some(([source, target]) => source === nodeId || target === nodeId)
  }, [nodeId, selection])
  const newSelection = useMemo<Selection>(() => ({
    type: 'nodes',
    nodes: [nodeId],
    origin: 'path',
  }), [nodeId])
  return (
    <Fragment key={nodeId}>
      <SelectButton isSelected={isNodeSelected} text={nodeId} selection={newSelection} />
      <div className="select-text whitespace-pre font-mono">{vector}</div>
    </Fragment>
  )
}
