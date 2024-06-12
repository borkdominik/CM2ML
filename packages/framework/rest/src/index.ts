import { plugins } from '@cm2ml/builtin'
import { createServer } from '@cm2ml/rest-adapter'

export function startPreConfiguredServer() {
  createServer()
    .applyAll(plugins)
    .start()
}
