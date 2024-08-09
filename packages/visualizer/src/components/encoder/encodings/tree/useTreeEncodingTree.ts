import type { Id2WordMapping, RecursiveTreeNode, TreeModel, TreeNodeValue } from '@cm2ml/builtin'
import { useQuery } from '@tanstack/react-query'

type TreeWorker = typeof import('./treeEncodingTreeWorker')

const worker = new ComlinkWorker<TreeWorker>(new URL('./treeEncodingTreeWorker', import.meta.url))

export function useTreeEncodingTree(tree: TreeModel<RecursiveTreeNode>, idWordMapping: Id2WordMapping, staticVocabulary: TreeNodeValue[]) {
  return useQuery({ queryKey: ['tree', tree, idWordMapping, staticVocabulary], queryFn: () => worker.createFlowGraphFromTree(tree, idWordMapping, staticVocabulary) })
}
