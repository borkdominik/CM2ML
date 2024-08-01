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
  ['raw-graph', 'Raw graph'],
  ['tree', 'Tree-based'],
]

const encoderNameToPrettyName: Record<string, string> = Object.fromEntries(encoderPairs)

export function prettifyEncoderName(name: string) {
  return encoderNameToPrettyName[name] ?? name
}
