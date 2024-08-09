import type { CostFunction } from './cost'
import { CostCache } from './cost'

export type { CostFunction }

export interface Options<Vertex> {
  /**
   * Maximum number of iterations. If set to a negative value, the algorithm will run until no further improvement can be made.
   * Defaults to `10`.
   */
  maxIterations?: number | undefined
  /**
   * See {@link CostFunction}.
   * Defaults to `() => 1`.
   */
  cost?: CostFunction<Vertex> | undefined
}

export type AnySet<T> = Set<T> | ReadonlySet<T>

/**
 * Creates two balanced partitions for a set of vertices using the Kernighan-Lin algorithm.
 * @param vertices - The set of vertices to partition. Note: The vertices must be hashable to support the usage of sets and maps.
 * @param getConnections - A function that returns the connections of a vertex, i.e., the set of vertices a given vertex is connected to.
 * @param options - The options for the algorithm. See {@link Options}.
 * @returns The two partitions of the vertices.
 */
export function kernighanLin<Vertex>(
  vertices: AnySet<Vertex>,
  getConnections: (vertex: Vertex) => AnySet<Vertex>,
  { maxIterations = 10, cost = () => 1 }: Options<Vertex>,
): readonly [Set<Vertex>, Set<Vertex>] {
  // 1. Create initial partitions
  const partitions = createInitialPartitions(vertices)

  if (vertices.size <= 2) {
    // If we have less than 3 vertices, we don't have to do anything
    return asSets(partitions)
  }

  const [A, B] = partitions

  // 3. Get all connections
  const connections = new Map<Vertex, AnySet<Vertex>>(
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
    for (let n = 1; n < vertices.size / 2; n++) {
      let bestSwap: Swap<Vertex> | undefined
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
        throw new Error('No max result found. Please report this internal error.')
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

    // 8. Find the best number of swaps
    const { k, gMax } = findGMax(gv)
    if (gMax > 0) {
      for (let i = 0; i <= k; i++) {
        // 9. Swap the vertices
        const avi = av[i]
        const bvi = bv[i]
        if (!avi || !bvi) {
          throw new Error(`avi or bvi not found. Index ${i} out-of-bounds. Please report this internal error.`)
        }
        const aIndex = A.indexOf(avi)
        const bIndex = B.indexOf(bvi)
        if (aIndex === -1 || bIndex === -1) {
          throw new Error('aIndex or bIndex not found. Please report this internal error.')
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
  return asSets(partitions)
}

function createInitialPartitions<Vertex>(vertices: AnySet<Vertex>) {
  const A: Vertex[] = []
  const B: Vertex[] = []
  let index = 0
  for (const vertex of vertices) {
    if (index++ % 2 === 0) {
      A.push(vertex)
    } else {
      B.push(vertex)
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
    throw new Error('No gMax result found. Please report this internal error.')
  }
  if (gMaxResult.k === 0) {
    gMaxResult.gMax = gv[0] ?? gMaxResult.gMax
  }
  return gMaxResult
}

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0)
}

interface Swap<Vertex> {
  a: Vertex
  b: Vertex
  g: number
}

function asSets<Vertex>(partitions: readonly [Vertex[], Vertex[]]) {
  return [new Set(partitions[0]), new Set(partitions[1])] as const
}

export interface RecursiveOptions<Vertex> extends Options<Vertex> {
  /**
   * Maximum size for partitions.
   */
  maxPartitionSize: number
}

/**
 * Creates balanced partitions for a set of vertices using the Kernighan-Lin algorithm.
 * @param vertices - The set of vertices to partition. Note: The vertices must be hashable to support the usage of sets and maps.
 * @param getConnections - A function that returns the connections of a vertex, i.e., the set of vertices a given vertex is connected to.
 * @param options - The options for the algorithm. See {@link RecursiveOptions}.
 * @returns The partitions of the vertices.
 */
export function recursiveKernighanLin<Vertex>(vertices: AnySet<Vertex>, getConnections: (vertex: Vertex) => AnySet<Vertex>, options: RecursiveOptions<Vertex>): Set<Vertex>[] {
  if (options.maxPartitionSize <= 0) {
    throw new Error('The partition size limit must be greater than 0.')
  }
  if (options.maxPartitionSize === 1) {
    return Array
      .from(vertices)
      .map((vertex) => new Set([vertex]))
  }
  return kernighanLin(vertices, getConnections, options)
    .flatMap((partition) => {
      if (partition.size <= options.maxPartitionSize) {
      // The partition is small enough, return it as is
        return [partition]
      }
      // The partition is too large, split it recursively
      return recursiveKernighanLin(partition, getConnections, options)
    })
}
