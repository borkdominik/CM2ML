/**
 * Cost of the edge between two vertices.
 * Note: Because the algorithm operates on undirected graphs, the cost function must be symmetric.
 */
export type CostFunction<Vertex> = (a: Vertex, b: Vertex) => number

export class CostCache<Vertex> {
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
