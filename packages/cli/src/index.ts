import { createCLI } from '@cm2ml/cli-adapter'
import { encoders } from '@cm2ml/encoders'

export function run() {
  createCLI().applyAll(encoders).start()
}
