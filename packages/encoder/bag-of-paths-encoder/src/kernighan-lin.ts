import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { BoPParameters } from './bop-types'

export function kernighanLin(nodes: GraphNode[], { maxIterations }: Pick<BoPParameters, 'maxIterations'>) {
  const A: GraphNode[] = []
  const B: GraphNode[] = []

  function D(s: GraphNode, internal: GraphNode[], external: GraphNode[]) {
    const incoming = Stream.from(s.incomingEdges).map(({ source }) => source)
    const outgoing = Stream.from(s.outgoingEdges).map(({ target }) => target)
    const connected = incoming.concat(outgoing).cache()
    const Is = connected.filter((n) => internal.includes(n)).toArray().length
    const Es = connected.filter((n) => external.includes(n)).toArray().length
    const Ds = Es - Is
    return Ds
  }
  nodes.forEach((node, i) => {
    if (i % 2 === 0) {
      A.push(node)
    } else {
      B.push(node)
    }
  })
  let iteration = 0
  // eslint-disable-next-line no-unmodified-loop-condition
  while (maxIterations < 0 || iteration++ < maxIterations) {
    const DValues = new Map<GraphNode, number>()

    const ignoredNodes = new Set<GraphNode>()

    function updateDValues() {
      for (const node of A) {
        if (ignoredNodes.has(node)) {
          continue
        }
        DValues.set(node, D(node, A, B))
      }
      for (const node of B) {
        if (ignoredNodes.has(node)) {
          continue
        }
        DValues.set(node, D(node, B, A))
      }
    }

    updateDValues()

    const c = 1 // all edges have the same weight
    const av: GraphNode[] = []
    const bv: GraphNode[] = []
    const gv: number[] = []

    for (let n = 1; n < nodes.length / 2; n++) {
      let maxResult: MaxResult | undefined
      for (const a of A) {
        if (ignoredNodes.has(a)) {
          continue
        }
        for (const b of B) {
          if (ignoredNodes.has(b)) {
            continue
          }
          const g = DValues.get(a)! + DValues.get(b)! - 2 * c
          if (!maxResult || g > maxResult.g) {
            maxResult = { a, b, g }
          }
        }
      }
      if (!maxResult) {
        throw new Error('No max result found')
      }
      av.push(maxResult.a)
      bv.push(maxResult.b)
      gv.push(maxResult.g)
      ignoredNodes.add(maxResult.a)
      ignoredNodes.add(maxResult.b)
      updateDValues()
    }
    const { k, gMax } = findGMax(gv)
    if (gMax > 0) {
      for (let i = 0; i < k; i++) {
        const avi = av[i]
        const bvi = bv[i]
        if (!avi || !bvi) {
          throw new Error('avi or bvi not found')
        }
        A[A.indexOf(avi)] = bvi
        B[B.indexOf(bvi)] = avi
      }
    }
    if (gMax <= 0) {
      break
    }
  }
  return [A, B] as const
}

interface GMaxResult {
  k: number
  gMax: number
}
function findGMax(gv: number[]) {
  function sum(k: number) {
    return gv.slice(0, k).reduce((acc, g) => acc + g, 0)
  }
  const sumsWithK = gv.map((_, k) => ({ k, gMax: sum(k) }))
  let gMaxResult: GMaxResult | undefined
  for (const { k, gMax } of sumsWithK) {
    if (!gMaxResult || gMax > gMaxResult.gMax) {
      gMaxResult = { k, gMax }
    }
  }
  if (!gMaxResult) {
    throw new Error('No gMax result found')
  }
  return gMaxResult
}

interface MaxResult {
  a: GraphNode
  b: GraphNode
  g: number
}
