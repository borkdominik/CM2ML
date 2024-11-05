import type { DB, Matches, Pattern } from './types'

export function isClosed(db: DB, pattern: Pattern, matches: Matches, _maxLength: number) {
  return !reverseScan(db, [null, ...pattern, null], matches.map(([i, _]) => [i, db[i]!.length])) && !forwardScan(db, matches)
}

export function canClosedPrune(db: DB, pattern: Pattern, matches: Matches, _maxLength: number) {
  return reverseScan(db, [null, ...pattern], [...matches])
}

function forwardScan(db: DB, matches: Matches): boolean {
  const closedItems = new Set<number>()

  matches.forEach(([i, endPos], k) => {
    const localItems = new Set<number>()
    for (let startPos = endPos + 1; startPos < db[i]!.length; startPos++) {
      const item = db[i]![startPos]!
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

function reverseScan(db: DB, pattern: (number | null)[], matches: Matches): boolean {
  function isLocalClosed(prevItem: number | null): boolean {
    const closedItems = new Set<number>()

    matches.forEach(([i, endpos], k) => {
      const localItems = new Set<number>()

      for (let startPos = endpos - 1; startPos >= 0; startPos--) {
        const item = db[i]![startPos]!
        if (item === prevItem) {
          matches[k] = [i, startPos]
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

  return pattern
    .slice(0, pattern.length - 1) // remove last item
    .reverse()
    .some((prevItem) => isLocalClosed(prevItem))
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
