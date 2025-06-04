const parserPairs = [
  ['archimate', 'ArchiMate'],
  ['ecore', 'Ecore'],
  ['uml', 'UML'],
]

const parserNameToLanguageName: Record<string, string> = Object.fromEntries(parserPairs)

export function prettifyParserName(name: string) {
  return parserNameToLanguageName[name] ?? name
}

const encoderPairs = [
  ['bag-of-paths', 'Bag-of-Paths'],
  ['bag-of-words', 'Bag-of-Words'],
  ['embeddings', 'Embeddings'],
  ['feature-encoder', 'Feature encoder'],
  ['pattern-miner', 'Pattern miner'],
  ['raw-graph', 'Raw graph'],
  ['tree', 'Tree-based'],
  ['triples', 'Triples'],
  ['term-frequency', 'Term Frequency'],
]

const encoderNameToPrettyName: Record<string, string> = Object.fromEntries(encoderPairs)

export function prettifyEncoderName(name: string) {
  return encoderNameToPrettyName[name] ?? name
}
