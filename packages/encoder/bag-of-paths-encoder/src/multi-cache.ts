export class MultiCache<OK, IK, V> {
  private readonly cache: Map<OK, Map<IK, V>> = new Map()

  public compute(outerKey: OK, innerKey: IK, fallback: () => V): V {
    if (!this.cache.has(outerKey)) {
      this.cache.set(outerKey, new Map())
    }
    const cachedValue = this.cache.get(outerKey)?.get(innerKey)
    if (cachedValue !== undefined) {
      return cachedValue
    }
    const value = fallback()
    this.cache.get(outerKey)!.set(innerKey, value)
    return value
  }
}
