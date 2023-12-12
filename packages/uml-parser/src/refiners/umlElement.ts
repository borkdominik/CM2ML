import type { GraphNode } from '@cm2ml/ir'

export class UmlElement {
  readonly #isAssignable: (node: GraphNode) => boolean
  readonly #refine?: (node: GraphNode) => void
  private readonly subRefiners: UmlElement[] = []
  public constructor(
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
    private readonly parent?: UmlElement,
  ) {
    this.#isAssignable = isAssignable
    this.#refine = refine
  }

  public isAssignable(node: GraphNode): boolean {
    return (
      this.#isAssignable(node) ||
      this.subRefiners.some((r) => r.isAssignable(node))
    )
  }

  public refine(node: GraphNode): void {
    this.parent?.refine(node)
    this.#refine?.(node)
  }

  public extend(
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
  ): UmlElement {
    const subRefiner = new UmlElement(isAssignable, refine, this)
    this.subRefiners.push(subRefiner)
    return subRefiner
  }
}
