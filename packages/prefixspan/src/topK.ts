import { Heap } from 'heap-js'

import { canClosedPrune, isClosed } from './closed'
import type { DB, Key, Matches, Occurs, Pattern } from './types'

export interface TopKOptions {
  closed: boolean
  minLength: number
  maxLength: number
  key?: Key
  bound?: Key
  filter?: (pattern: Pattern, matches: Matches) => boolean
}

const defaultKey: Key = (_, matches) => matches.length

export function topK(db: DB, k: number, { bound = defaultKey, closed, filter, key = defaultKey, maxLength, minLength }: TopKOptions) {
  const results = new Heap<[number, Pattern, Matches]>(compareNestedArrays)

  function canPass(sup: number): boolean {
    return results.length === k && sup <= results.get(0)![0]
  }

  function verify(pattern: Pattern, matches: Matches) {
    const support = key(pattern, matches)
    if (canPass(support)) {
      return
    }

    if ((!filter || filter(pattern, matches)) &&
      (!closed || isClosed(db, pattern, matches, maxLength))
    ) {
      if (results.length < k) {
        results.push([support, pattern, matches])
      } else {
        results.pushpop([support, pattern, matches])
      }
    }
  }

  function topKRecursive(patt: Pattern, matches: Matches) {
    if (patt.length >= minLength) {
      verify(patt, matches)
      if (patt.length === maxLength) {
        return
      }
    }
    const occurs = nextEntries(db, matches)
    const sortedOccurs = sortOccurs(occurs, patt, key)
    for (const [newItem, newMatches] of sortedOccurs) {
      const newPattern = patt.concat(+newItem)
      if (canPass(bound(newPattern, newMatches))) {
        break
      }
      if (
        (closed && canClosedPrune(db, newPattern, newMatches, maxLength))
      ) {
        continue
      }
      topKRecursive(newPattern, newMatches)
    }
  }

  topKRecursive([], db.map((_, i) => [i, -1]))

  return sortResults(results.toArray())
    .map(([sup, patt, _matches]) => [sup, patt] as const)
}

function nextEntries(db: DB, matches: Matches): Occurs {
  const seqs = matches.map(([i, lastpos]) => db[i]!.slice(lastpos + 1)) // (data[i][lastpos + 1:] for i, lastpos in entries)
  return invertedIndex(
    seqs,
    matches,
  )
}

export function sortOccurs(occurs: Occurs, pattern: Pattern, key: Key) {
  return Object
    .entries(occurs)
    .map(([k, v]) => [+k, v] as const)
    .sort(([a0, a1], [b0, b1]) => {
      const aK = key(pattern.concat(a0), a1)
      const bK = key(pattern.concat(b0), b1)
      // Negate aK and bK to reverse the order for that argument
      return compareNestedArrays([-aK, a1], [-bK, b1])
    })
}

export function invertedIndex(sequences: number[][], matches?: Matches): Occurs {
  const index: Occurs = {}

  for (let k = 0; k < sequences.length; k++) {
    const sequence = sequences[k]!
    const [i, lastpos] = matches ? matches[k]! : [k, -1]
    const offset = lastpos + 1
    for (let p = 0; p < sequence.length; p++) {
      const item = sequence[p]!
      if (index[item] === undefined) {
        index[item] = []
      }
      const l = index[item]!
      if (l.length > 0 && l[l.length - 1]![0] === i) {
        continue
      }
      l.push([i, p + offset])
    }
  }

  return index
}

export function sortResults(results: [number, Pattern, Matches][]) {
  return results.sort(
    // Negate the first element of the tuple to reverse the order
    (a, b) => compareNestedArrays([-a[0]!, a[1]], [-b[0]!, b[1]]),
  )
}

export type NestedArray = (number | NestedArray)[]
const SMALLER = -1
const EQUAL = 0
const LARGER = 1
export function compareNestedArrays(a: NestedArray, b: NestedArray): typeof SMALLER | typeof EQUAL | typeof LARGER {
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i]
    const itemB = b[i]
    if (itemB === undefined) {
      return LARGER
    }
    if (typeof itemA !== typeof itemB) {
      throw new TypeError(`Cannot compare ${itemA} with ${itemB}`)
    }
    if (typeof itemA === 'number' && typeof itemB === 'number') {
      if (itemA !== itemB) {
        return itemA < itemB ? SMALLER : LARGER
      } else {
        continue
      }
    }
    if (Array.isArray(itemA) && Array.isArray(itemB)) {
      const subResult = compareNestedArrays(itemA, itemB)
      if (subResult !== EQUAL) {
        return subResult
      }
    }
  }
  if (b.length > a.length) {
    return SMALLER
  }
  return EQUAL
}
