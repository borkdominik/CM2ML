import type { GraphNode } from '@cm2ml/ir'

export class UmlElement {
  readonly #isAssignable: (node: GraphNode) => boolean
  readonly #refine?: (node: GraphNode) => void
  private readonly specializations: UmlElement[] = []

  public constructor(
    private readonly generalizations: UmlElement[],
    isAssignable: (node: GraphNode) => boolean,
    refine: ((node: GraphNode) => void) | undefined,
  ) {
    this.#isAssignable = isAssignable
    this.#refine = refine
  }

  public isAssignable(node: GraphNode): boolean {
    return (
      this.#isAssignable(node) ||
      this.specializations.some((r) => r.isAssignable(node))
    )
  }

  public refine(node: GraphNode): void {
    this.generalizations.forEach((parent) => parent.refine(node))
    this.#refine?.(node)
  }

  private extendBy(specialization: UmlElement) {
    this.specializations.push(specialization)
  }

  public extend(
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
  ) {
    return UmlElement.extendMultiple([this], isAssignable, refine)
  }

  public static extendMultiple(
    generalizations: UmlElement[],
    isAssignable: (node: GraphNode) => boolean,
    refine?: (node: GraphNode) => void,
  ) {
    const newType = new UmlElement(generalizations, isAssignable, refine)
    generalizations.forEach((p) => p.extendBy(newType))
    return newType
  }
}

export const extendMultiple = UmlElement.extendMultiple

export const Element = new UmlElement([], () => true, undefined)
