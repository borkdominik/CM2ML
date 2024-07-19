import type { Id2WordMapping, RecursiveTreeNode, TreeModel, TreeNodeValue } from '@cm2ml/builtin'
import { useEffect, useState } from 'react'

type TreeWorker = typeof import('./treeWorker')

const worker = new ComlinkWorker<TreeWorker>(new URL('./treeWorker', import.meta.url))

export function useTreeGraph(tree: TreeModel<RecursiveTreeNode>, idWordMapping: Id2WordMapping, staticVocabulary: TreeNodeValue[]) {
  const [result, setResult] = useState<ReturnType<TreeWorker['createFlowGraphFromTree']> | undefined>(undefined)
  useEffect(() => {
    async function createModel() {
      const result = await worker.createFlowGraphFromTree(tree, idWordMapping, staticVocabulary)
      setResult(result)
    }
    createModel()
  }, [tree, idWordMapping, staticVocabulary, worker])
  return result
}
