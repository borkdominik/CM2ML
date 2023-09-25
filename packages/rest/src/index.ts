import { encoders } from '@cm2ml/encoders'
import { createServer } from '@cm2ml/rest-adapter'

export function run() {
  createServer().applyAll(encoders).start()
}
