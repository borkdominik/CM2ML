import type { AdjacencyList, FeatureVectorTemplate, FeatureVector as FeatureVectorType } from '@cm2ml/builtin'
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
  nodeFeatures: FeatureVectorTemplate
  nodeFeaturesVectors: FeatureVectorType[]
}

export function SparseList({ list, nodes, nodeFeatures, nodeFeaturesVectors }: ListProps) {
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
                  <FeatureVector featureVector={nodeFeatures} />
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
                featureVector={nodeFeaturesVectors[index]}
              />
            ))}
            <ListBorder>]</ListBorder>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="h-full overflow-y-auto p-2">
          <span className="text-sm font-bold">Edges</span>
          <div className="flex flex-wrap font-mono text-xs">
            <ListBorder>[</ListBorder>
            {list.map(([source, target, weight], index) => (
              <ListEdge
                key={index}
                getOpacity={getOpacity}
                isLast={index === list.length - 1}
                nodes={nodes}
                source={source}
                target={target}
                weight={weight}
                indexPadding={listEdgePaddingAmount}
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
  featureVector: (string | null)[] | undefined
}

function ListNode({ node, isLast, featureVector }: ListNodeProps) {
  const isSelected = useIsSelectedNode(node)
  const setSelection = useSelection.use.setSelection()

  return (
    <>
      <TooltipProvider>
        <Tooltip disableHoverableContent={!featureVector}>
          <TooltipTrigger>
            <ListEntry
              onClick={() => setSelection({ selection: node, animate: true })}
              isSelected={isSelected}
              isLast={isLast}
            >
              {node}
            </ListEntry>
          </TooltipTrigger>
          <TooltipContent>
            <FeatureVector featureVector={featureVector ?? []} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
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
}

function ListEdge({
  getOpacity,
  indexPadding,
  isLast,
  nodes,
  source,
  target,
  weight,
}: ListEdgeProps) {
  const sourceId = nodes[source]
  const targetId = nodes[target]
  const isSelected = useIsSelectedEdge(sourceId, targetId)
  const setSelection = useSelection.use.setSelection()
  if (!sourceId || !targetId) {
    return null
  }
  const isTooltipDisabled = getOpacity === undefined
  function padIndex(index: number) {
    return index.toFixed(0).padStart(indexPadding, ' ')
  }
  const text = `[${padIndex(source)}, ${padIndex(target)}]`
  const entry = (
    <ListEntry
      key={`${source}-${target}`}
      isSelected={isSelected}
      onClick={() => setSelection({ selection: [[sourceId, targetId]], animate: true })}
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
          <TooltipContent>{weight ?? 1}</TooltipContent>
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
