export function prefixspan(db: number[][], minsup = 2) {
  const results: [number[], number[]][] = []

  function mine_rec(patt: number[], mdb: [number, number][]) {
    Object
      .entries(localOccurs(mdb))
      .forEach(([c, newmdb]) => {
        const newsup = newmdb.length
        if (newsup >= minsup) {
          const newpatt = patt.concat(+c)
          const second = newmdb.map(([i, _stoppos]) => i)
          results.push([newpatt, second])
          mine_rec(newpatt, newmdb)
        }
      })
  }

  function localOccurs(mdb: [number, number][]) {
    const occurs: Record<number, [number, number][]> = {}
    mdb.forEach(([i, stoppos]) => {
      const seq = db[i]!
      for (let j = stoppos; j < seq.length; j++) {
        if (!occurs[seq[j]!]) {
          occurs[seq[j]!] = []
        }
        const l = occurs[seq[j]!]!
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
