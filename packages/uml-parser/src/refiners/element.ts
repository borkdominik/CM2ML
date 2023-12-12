import type { GraphNode } from '@cm2ml/ir'

export class UmlElement {
  readonly #isAssignable: (node: GraphNode) => boolean
  readonly #refine?: (node: GraphNode) => void
  private readonly subtypes: UmlElement[] = []

  public constructor(
    private readonly parents: UmlElement[],
    isAssignable: (node: GraphNode) => boolean,
    refine: ((node: GraphNode) => void) | undefined,
  ) {
    this.#isAssignable = isAssignable
    this.#refine = refine
  }

  public isAssignable(node: GraphNode): boolean {
    return (
      this.#isAssignable(node) ||
      this.subtypes.some((r) => r.isAssignable(node))
    )
  }

  public refine(node: GraphNode): void {
    this.parents.forEach((parent) => parent.refine(node))
    this.#refine?.(node)
  }

  private extendBy(subtype: UmlElement) {
    this.subtypes.push(subtype)
  }

  public extend(
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
  ) {
    return UmlElement.extendMultiple([this], isAssignable, refine)
  }

  public static extendMultiple(
    parents: UmlElement[],
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
  ) {
    const newType = new UmlElement(parents, isAssignable, refine)
    parents.forEach((p) => p.extendBy(newType))
    return newType
  }
}

export const extendMultiple = UmlElement.extendMultiple

export const Element = new UmlElement([], () => true, undefined)
