/**
 * Cost of the edge between two vertices.
 * Note: Because the algorithm operates on undirected graphs, the cost function must be symmetric.
 */
export type CostFunction<Vertex> = (a: Vertex, b: Vertex) => number

export interface Options<Vertex> {
  /**
   * Maximum number of iterations. If set to a negative value, the algorithm will run until no further improvement can be made.
   * Defaults to `10`.
   */
  maxIterations?: number
  /**
   * See {@link CostFunction}.
   * Defaults to `() => 1`.
   */
  cost?: CostFunction<Vertex>
}

class CostCache<Vertex> {
  private cache = new Map<Vertex, Map<Vertex, number>>()

  public constructor(private readonly cost: CostFunction<Vertex>) { }

  private ensureCache(a: Vertex, b: Vertex) {
    if (!this.cache.has(a)) {
      this.cache.set(a, new Map())
    }
    if (!this.cache.has(b)) {
      this.cache.set(b, new Map())
    }
  }

  private getCachedCost(a: Vertex, b: Vertex) {
    return this.cache.get(a)!.get(b) ?? this.cache.get(b)!.get(a)
  }

  public getCost(a: Vertex, b: Vertex) {
    this.ensureCache(a, b)
    const cachedCost = this.getCachedCost(a, b)
    if (cachedCost !== undefined) {
      return cachedCost
    }
    const newCost = this.cost(a, b)
    this.cache.get(a)!.set(b, newCost)
    this.cache.get(b)!.set(a, newCost)
    return newCost
  }
}

/**
 * Partitions a set of vertices using the Kernighan-Lin algorithm.
 * @param vertices - The vertices to partition. May not contain duplicates.
 * @param getConnections - A function that returns the connections of a vertex, i.e., the set of vertices a given vertex is connected to.
 * @param options - The options for the algorithm. See {@link Options}.
 * @returns The two partitions of the vertices.
 */
export function kernighanLin<Vertex>(
  vertices: Vertex[],
  getConnections: (vertex: Vertex) => Set<Vertex>,
  { maxIterations = 10, cost = () => 1 }: Options<Vertex>,
): [Vertex[], Vertex[]] {
  const A: Vertex[] = []
  const B: Vertex[] = []

  // 1. Create initial partitions
  vertices.forEach((vertex, index) => {
    if (index % 2 === 0) {
      A.push(vertex)
    } else {
      B.push(vertex)
    }
  })

  if (vertices.length <= 2) {
    // If we have less than 3 vertices, we can't do anything
    return [A, B]
  }

  // 3. Get all connections
  const connections = new Map<Vertex, Set<Vertex>>(
    [...vertices.values()]
      .map((vertex) =>
        [vertex, getConnections(vertex)],
      ),
  )

  const costCache = new CostCache(cost)
  function D(s: Vertex, internal: Set<Vertex>, external: Set<Vertex>) {
    const connectedVertices = connections.get(s)
    if (connectedVertices === undefined) {
      return 0
    }
    let Is = 0
    let Es = 0
    for (const v of connectedVertices) {
      if (internal.has(v)) {
        Is += costCache.getCost(s, v)
      } else if (external.has(v)) {
        Es += costCache.getCost(s, v)
      }
    }
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

    // 4. Calculate initial D values
    updateDValues()

    const av: Vertex[] = []
    const bv: Vertex[] = []
    const gv: number[] = []

    // 5. Find the optimal swaps
    for (let n = 1; n < vertices.length / 2; n++) {
      let bestSwap: MaxResult<Vertex> | undefined
      for (const a of ASet) {
        for (const b of BSet) {
          const c = costCache.getCost(a, b)
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
      // 6. Remove the vertices from consideration for the current iteration
      ASet.delete(bestSwap.a)
      BSet.delete(bestSwap.b)
      // 7. Update D values
      updateDValues()
    }

    // 8. Find the best swap amount
    const { k, gMax } = findGMax(gv)
    if (gMax > 0) {
      for (let i = 0; i <= k; i++) {
        // 9. Swap the vertices
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
      // 10. No further improvement can be made
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
