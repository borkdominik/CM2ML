import type { DB, Matches, Occurs, Pattern } from './types'

export function prefixspan(db: DB, minSupport: number) {
  const results: [Pattern, number[]][] = []

  function mine_rec(patt: number[], matches: Matches) {
    Object
      .entries(localOccurs(matches))
      .forEach(([c, newMatches]) => {
        const newSupport = newMatches.length
        if (newSupport >= minSupport) {
          const newPattern = patt.concat(+c)
          const second = newMatches.map(([i, _stopPos]) => i)
          results.push([newPattern, second])
          mine_rec(newPattern, newMatches)
        }
      })
  }

  function localOccurs(matches: Matches) {
    const occurs: Occurs = {}
    matches.forEach(([i, stopPos]) => {
      const sequence = db[i]!
      for (let j = stopPos; j < sequence.length; j++) {
        if (!occurs[sequence[j]!]) {
          occurs[sequence[j]!] = []
        }
        const l = occurs[sequence[j]!]!
        if (l.length === 0 || l.at(-1)![0] !== i) {
          l.push([i, j + 1])
        }
      }
    })
    return occurs
  }

  mine_rec([], db.map((_, i) => [i, 0]))
  return results
}
