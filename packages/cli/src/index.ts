import { cm2mlCLI } from '@cm2ml/cli-adapter'
import { encoders } from '@cm2ml/encoders'

export function run() {
  cm2mlCLI().applyAll(encoders).start()
}
