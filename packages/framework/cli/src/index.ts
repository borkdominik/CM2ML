import { batchedPlugins, plugins } from '@cm2ml/builtin'
import { createCLI } from '@cm2ml/cli-adapter'

export function startPreConfiguredCli() {
  createCLI()
    .applyAll(batchedPlugins, { batched: true })
    .applyAll(plugins, { batched: false })
    .start()
}
