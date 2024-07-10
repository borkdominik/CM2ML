import type { DB, Matches, Pattern } from './types'

export function isClosed(db: DB, patt: Pattern, matches: Matches) {
  return !reverseScan(db, [null, ...patt, null], matches.map(([i, _]) => [i, db[i]!.length])) && !forwardScan(db, matches)
}

export function canClosedPrune(db: DB, patt: Pattern, matches: Matches) {
  return reverseScan(db, [null, ...patt], [...matches])
}

function forwardScan(db: DB, matches: Matches): boolean {
  const closedItems = new Set<number>()

  matches.forEach(([i, endpos], k) => {
    const localItems = new Set<number>()
    for (let startpos = endpos + 1; startpos < db[i]!.length; startpos++) {
      const item = db[i]![startpos]!
      localItems.add(item)
    }

    if (k === 0) {
      update(closedItems, localItems)
    } else {
      updateIntersection(closedItems, localItems)
    }
  })

  return closedItems.size > 0
}

function reverseScan(db: DB, patt: (number | null)[], matches: Matches): boolean {
  function isLocalClosed(previtem: number | null): boolean {
    const closedItems = new Set<number>()

    matches.forEach(([i, endpos], k) => {
      const localItems = new Set<number>()

      for (let startpos = endpos - 1; startpos >= 0; startpos--) {
        const item = db[i]![startpos]!
        if (item === previtem) {
          matches[k] = [i, startpos]
          break
        }
        localItems.add(item)
      }

      if (k === 0) {
        update(closedItems, localItems)
      } else {
        updateIntersection(closedItems, localItems)
      }
    })

    return closedItems.size > 0
  }

  return patt
    .slice(0, patt.length - 1) // remove last item
    .reverse()
    .some((previtem) => isLocalClosed(previtem))
}

function update<T>(a: Set<T>, b: Set<T>) {
  b.forEach((item) => a.add(item))
}

function updateIntersection<T>(a: Set<T>, b: Set<T>) {
  a.forEach((item) => {
    if (!b.has(item)) {
      a.delete(item)
    }
  })
}
