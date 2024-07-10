import { BagOfPathsEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function BagOfPathsEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(BagOfPathsEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  const itemSet = encoding.data
  return (
    <div className="h-full overflow-y-auto px-4 py-2">
      {JSON.stringify(itemSet, null, 2)}
      {/* <ItemSet itemSet={itemSet} /> */}
    </div>
  )
}

// interface ColumnProps {
//   itemSet: Embedding
//   row: number
// }

// function Row({ itemSet, row }: ColumnProps) {
//   return (
//     <tr className="flex w-full justify-between gap-4">
//       {itemSet.map((column, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <td key={i} style={{ 'flexGrow': i === 0 ? 1 : 0 }}>
//           {column[row]}
//         </td>
//       ))}
//     </tr>

//   )
// }

// interface ItemSetProps {
//   itemSet: Embedding
// }

// // TODO/Jan: Use virtualized list?
// // TODO/Jan: Enable selections -> Include mapping to original graph via metadata (must be done for each partition!)
// // Add toggle param to emit this extra data
// // TODO/Jan: Also emit the labeled partition graphs via metadata and render them here
// function ItemSet({ itemSet }: ItemSetProps) {
//   return (
//     <table className="mx-auto font-mono text-xs">
//       <tbody className="flex flex-col gap-1">
//         {itemSet[0].map((_, i) => (
//           <Row key={itemSet[0][i]} itemSet={itemSet} row={i} />
//         ))}
//       </tbody>
//     </table>
//   )
// }
