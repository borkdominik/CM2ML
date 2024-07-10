export type Pattern = number[]

export type Matches = [number, number][]

export type Key = (pattern: Pattern, matches: Matches) => number

export type Occurs = Record<number, Matches>

export type DB = number[][]
