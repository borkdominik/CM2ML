import { batchedPlugins, plugins } from '@cm2ml/builtin'
import { createServer } from '@cm2ml/rest-adapter'

export function startPreConfiguredServer() {
  createServer()
    .applyAll(batchedPlugins, { batched: true })
    .applyAll(plugins, { batched: false })
    .start()
}
