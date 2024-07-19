import type { RecursiveTreeNode, TreeFormat, TreeNodeValue } from '@cm2ml/builtin'

import type { FlowNode } from './treeTypes'

export function getNodeIdSelection(
  value: TreeNodeValue,
  parent: FlowNode | undefined,
  format: TreeFormat,
): TreeNodeValue | undefined {
  if (!parent) {
    return undefined
  }
  if (format === 'global') {
    if (!(parent.value === 'OBJ'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && value !== 'ATTS')) { // is not the ATTS node at the same level as the id node
      return undefined
    }
    return value
  }
  if (format === 'local') {
    if (!(parent.value === 'NAME'
      && parent.parent?.value === 'CLS'
      && parent.parent.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined)) {
      return undefined
    }
    return value
  }
  if (format === 'compact') {
    if (!(parent.value === 'MODEL' && parent.parent === undefined)) {
      return undefined
    }
    return value
  }
  return undefined
}

export function getEdgeSourceSelection(
  value: TreeNodeValue,
  index: number,
  parent: FlowNode | undefined,
  format: TreeFormat,
  rawParent: RecursiveTreeNode | undefined,
): [TreeNodeValue, TreeNodeValue] | undefined {
  if (!parent) {
    return undefined
  }
  if (format === 'global') {
    if (!(parent.value === 'ASSOC'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && index === 1)) {
      return undefined
    }
    const explicitTarget = rawParent?.children[2]?.value
    if (explicitTarget === undefined) {
      throw new Error('Invalid edge source state. This is an internal error.')
    }
    return [value, explicitTarget]
  }
  if (format === 'local') {
    // local format has the current CLS context as implicit edge source
    return undefined
  }
  if (format === 'compact') {
    // local format has the current context as implicit edge source
    return undefined
  }
  return undefined
}

export function getEdgeTargetSelection(
  value: TreeNodeValue,
  index: number,
  parent: FlowNode | undefined,
  format: TreeFormat,
  rawParent: RecursiveTreeNode | undefined,
  rawGrandParent: RecursiveTreeNode | undefined,
): [TreeNodeValue, TreeNodeValue] | undefined {
  if (!parent) {
    return undefined
  }
  if (format === 'global') {
    if (!(parent.value === 'ASSOC'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && index === 2)) {
      return undefined
    }
    const explicitSource = rawParent?.children[1]?.value
    if (explicitSource === undefined) {
      throw new Error('Invalid edge target state. This is an internal error.')
    }
    return [explicitSource, value]
  }
  if (format === 'local') {
    if (!(parent.value === 'ASSOCS'
      && parent.parent?.value === 'CLS'
      && parent.parent.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined)) {
      return undefined
    }
    const implicitSource = rawGrandParent?.children[0]?.children[0]?.value
    if (implicitSource === undefined) {
      throw new Error('Invalid edge target state. This is an internal error.')
    }
    return [implicitSource, value]
  }
  if (format === 'compact') {
    if (!(parent.value === 'ASSOCS'
      && parent.parent?.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined)) {
      return undefined
    }
    return [parent.parent.value, value]
  }
  return undefined
}
