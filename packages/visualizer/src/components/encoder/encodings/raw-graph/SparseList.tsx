import type { AdjacencyList, FeatureMetadata, FeatureVector as FeatureVectorType } from '@cm2ml/builtin'
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import type { HTMLAttributes, ReactNode } from 'react'
import { useMemo } from 'react'

import { useIsSelectedEdge, useIsSelectedNode, useSelection } from '../../../../lib/useSelection'
import { cn, createOpacityRangeMapper } from '../../../../lib/utils'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../ui/resizable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip'

import { FeatureVector } from './Features'

interface ListProps {
  list: AdjacencyList
  nodes: string[]
  nodeFeatures: FeatureMetadata
  nodeFeatureVectors: FeatureVectorType[]
  edgeFeatures: FeatureMetadata
  edgeFeatureVectors: FeatureVectorType[]
}

export function SparseList({ list, nodes, nodeFeatures, nodeFeatureVectors, edgeFeatures, edgeFeatureVectors }: ListProps) {
  const getOpacity = useWeightedOpacityFromList(list)
  const listEdgePaddingAmount = nodes.length.toFixed(0).length
  return (
    <ResizablePanelGroup direction="vertical" className="h-full select-none">
      <ResizablePanel>
        <div className="h-full overflow-y-auto p-2">
          <div className="flex justify-between">
            <span className="text-sm font-bold">
              Nodes
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionMarkCircledIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <FeatureVector data={nodeFeatures} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap font-mono text-xs">
            <ListBorder>[</ListBorder>
            {nodes.map((node, index) => (
              <ListNode
                key={node}
                node={node}
                isLast={index === nodes.length - 1}
                featureVector={nodeFeatureVectors[index]}
              />
            ))}
            <ListBorder>]</ListBorder>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="h-full overflow-y-auto p-2">
          <div className="flex justify-between">
            <span className="text-sm font-bold">
              Edges
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionMarkCircledIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <FeatureVector data={edgeFeatures} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap font-mono text-xs">
            <ListBorder>[</ListBorder>
            {list.map(([source, target, weight], index) => (
              <ListEdge
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                getOpacity={getOpacity}
                isLast={index === list.length - 1}
                nodes={nodes}
                source={source}
                target={target}
                weight={weight}
                indexPadding={listEdgePaddingAmount}
                featureVector={edgeFeatureVectors[index]}
              />
            ))}
            <ListBorder>]</ListBorder>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface ListNodeProps {
  node: string
  isLast: boolean
  featureVector: FeatureVectorType | undefined
}

function ListNode({ node, isLast, featureVector }: ListNodeProps) {
  const isSelected = useIsSelectedNode(node)
  const setSelection = useSelection.use.setSelection()

  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={!featureVector}>
        <TooltipTrigger>
          <ListEntry
            onClick={() => setSelection({ type: 'nodes', nodes: [node], origin: 'graph' })}
            isSelected={isSelected}
            isLast={isLast}
          >
            {node}
          </ListEntry>
        </TooltipTrigger>
        <TooltipContent>
          {featureVector ? <FeatureVector data={featureVector} /> : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ListEdgeProps {
  getOpacity?: (weight: number) => number
  indexPadding: number
  isLast: boolean
  nodes: string[]
  source: number
  target: number
  weight: number | undefined
  featureVector: FeatureVectorType | undefined
}

function ListEdge({
  getOpacity,
  indexPadding,
  isLast,
  nodes,
  source,
  target,
  weight,
  featureVector,
}: ListEdgeProps) {
  const sourceId = nodes[source]
  const targetId = nodes[target]
  const isSelected = useIsSelectedEdge(sourceId, targetId)
  const setSelection = useSelection.use.setSelection()
  if (!sourceId || !targetId) {
    return null
  }
  const isTooltipDisabled = !getOpacity && !featureVector
  function padIndex(index: number) {
    return index.toFixed(0).padStart(indexPadding, ' ')
  }
  const text = `[${padIndex(source)}, ${padIndex(target)}]`
  const entry = (
    <ListEntry
      key={`${source}-${target}`}
      isSelected={isSelected}
      onClick={() => setSelection({ type: 'edges', edges: [[sourceId, targetId]], origin: 'graph' })}
      style={{ opacity: getOpacity?.(weight ?? 1) ?? 1 }}
      isLast={isLast}
    >
      <span className="whitespace-pre">{text}</span>
    </ListEntry>
  )
  return isTooltipDisabled
    ? entry
    : (
        <TooltipProvider>
          <Tooltip disableHoverableContent={isTooltipDisabled}>
            <TooltipTrigger>{entry}</TooltipTrigger>
            <TooltipContent>
              <div>
                {getOpacity ? (weight ?? 1) : null}
                {featureVector ? <FeatureVector data={featureVector} /> : null}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
}

function useWeightedOpacityFromList(list: AdjacencyList) {
  return useMemo(() => {
    if ((list[0]?.length ?? 2) === 2) {
      return undefined
    }
    const weights = list.map(([, , weight]) => weight ?? 1)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    return createOpacityRangeMapper(min, max)
  }, [list])
}

interface ListEntryProps {
  children: ReactNode
  isLast: boolean
  isSelected: boolean
  onClick?: () => void
  style?: HTMLAttributes<HTMLSpanElement>['style']
}

function ListEntry({
  children,
  isLast,
  isSelected,
  onClick,
  style,
}: ListEntryProps) {
  return (
    <div className="size-fit">
      <span
        className={cn({
          'mx-1 my-0.5 py-0.5 px-1 rounded-sm hover:outline hover:outline-accent-foreground hover:bg-accent hover:text-accent-foreground':
            true,
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground':
            isSelected,
        })}
        onClick={onClick}
        style={style}
      >
        {children}
      </span>
      {!isLast ? <ListSeparator /> : null}
    </div>
  )
}

function ListSeparator() {
  return <span className="my-0.5 py-0.5">,</span>
}

function ListBorder({ children }: { children: ReactNode }) {
  return <span className="my-0.5 w-full py-0.5 font-bold">{children}</span>
}
