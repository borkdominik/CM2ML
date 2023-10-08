import { createCLI } from '@cm2ml/cli-adapter'
import { stringEncoders } from '@cm2ml/encoders'

export function startPreConfiguredCli() {
  createCLI().applyAll(stringEncoders).start()
}
