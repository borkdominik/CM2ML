import { Stream } from '@yeger/streams'

export function displayName(name: string) {
  let displayName = ''
  Stream.from(name.replaceAll('-', ' ')).forEach((character) => {
    if (character === character.toUpperCase()) {
      displayName += ` ${character}`
      return
    }
    displayName += character
  })
  displayName = displayName[0]?.toUpperCase() + displayName.slice(1)
  return displayName.trim()
}
