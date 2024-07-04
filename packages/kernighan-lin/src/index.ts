export interface Options<Vertex> {
  maxIterations?: number
  cost?: (a: Vertex, b: Vertex) => number
}

export function kernighanLin<Vertex>(vertices: Vertex[], getConnectedVertices: (vertex: Vertex) => Vertex[], { maxIterations = 10, cost = () => 1 }: Options<Vertex>): [Vertex[], Vertex[]] {
  const A: Vertex[] = []
  const B: Vertex[] = []
  vertices.forEach((vertex, i) => {
    if (i % 2 === 0) {
      A.push(vertex)
    } else {
      B.push(vertex)
    }
  })

  if (vertices.length <= 2) {
    return [A, B]
  }

  const connections = new Map<Vertex, Vertex[]>()
  vertices.forEach((vertex) => {
    connections.set(vertex, getConnectedVertices(vertex))
  })

  function D(s: Vertex, internal: Set<Vertex>, external: Set<Vertex>) {
    const connectedVertices = connections.get(s)
    if (connectedVertices === undefined) {
      return 0
    }
    const Is = sum(connectedVertices.map((v) => internal.has(v) ? cost(s, v) : 0))
    const Es = sum(connectedVertices.map((v) => external.has(v) ? cost(s, v) : 0))
    const Ds = Es - Is
    return Ds
  }

  let iteration = 0
  // eslint-disable-next-line no-unmodified-loop-condition
  while (maxIterations < 0 || iteration++ < maxIterations) {
    const DValues = new Map<Vertex, number>()

    const ASet = new Set(A)
    const BSet = new Set(B)

    function updateDValues() {
      for (const vertex of ASet) {
        DValues.set(vertex, D(vertex, ASet, BSet))
      }
      for (const vertex of BSet) {
        DValues.set(vertex, D(vertex, BSet, ASet))
      }
    }

    updateDValues()

    const av: Vertex[] = []
    const bv: Vertex[] = []
    const gv: number[] = []

    for (let n = 1; n < vertices.length / 2; n++) {
      let bestSwap: MaxResult<Vertex> | undefined
      for (const a of ASet) {
        for (const b of BSet) {
          const c = cost(a, b) * (connections.get(a)?.filter((v) => v === b).length ?? 0)
          const g = DValues.get(a)! + DValues.get(b)! - 2 * c
          if (!bestSwap || g > bestSwap.g) {
            bestSwap = { a, b, g }
          }
        }
      }
      if (!bestSwap) {
        throw new Error('No max result found')
      }
      av.push(bestSwap.a)
      bv.push(bestSwap.b)
      gv.push(bestSwap.g)
      ASet.delete(bestSwap.a)
      BSet.delete(bestSwap.b)
      updateDValues()
    }

    const { k, gMax } = findGMax(gv)
    if (gMax > 0) {
      for (let i = 0; i <= k; i++) {
        const avi = av[i]
        const bvi = bv[i]
        if (!avi || !bvi) {
          throw new Error('avi or bvi not found')
        }
        const aIndex = A.indexOf(avi)
        const bIndex = B.indexOf(bvi)
        if (aIndex === -1 || bIndex === -1) {
          throw new Error('aIndex or bIndex not found')
        }
        A[aIndex] = bvi
        B[bIndex] = avi
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
  const sumsWithK = gv.map((_, k) => ({ k, gMax: sum(gv.slice(0, k + 1)) }))
  let gMaxResult: GMaxResult | undefined
  for (const { k, gMax } of sumsWithK) {
    if (!gMaxResult || gMax > gMaxResult.gMax) {
      gMaxResult = { k, gMax }
    }
  }
  if (!gMaxResult) {
    throw new Error('No gMax result found')
  }
  if (gMaxResult.k === 0) {
    gMaxResult.gMax = gv[0] ?? gMaxResult.gMax
  }
  return gMaxResult
}

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0)
}

// Iterative implementation is somehow slower, TODO/Jan: Bench with real encoding run
// function findGMax(gv: number[]) {
//   const bestGMaxResult: GMaxResult = { k: -1, gMax: -Infinity }
//   const runningSums: number[] = []
//   for (let k = 0; k < gv.length; k++) {
//     const previous = runningSums[k - 1] ?? 0
//     const gMax = gv[k]! + previous
//     runningSums.push(gMax)
//     if (gMax > bestGMaxResult.gMax) {
//       bestGMaxResult.k = k
//       bestGMaxResult.gMax = gMax
//     }
//   }
//   if (bestGMaxResult.k === -1) {
//     throw new Error('No gMax result found')
//   }
//   bestGMaxResult.k += 1
//   return bestGMaxResult
// }

interface MaxResult<Vertex> {
  a: Vertex
  b: Vertex
  g: number
}
