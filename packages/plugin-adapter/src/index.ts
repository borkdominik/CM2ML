import { type ParameterMetadata, type Plugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export abstract class PluginAdapter<In> {
  protected plugins = new Map<string, Plugin<In, unknown, any>>()

  private started = false

  public applyAll(plugins: Plugin<In, unknown, ParameterMetadata>[]) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply(
    plugin: Plugin<In, unknown, ParameterMetadata>
  ): PluginAdapter<In> {
    this.requireNotStarted()
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already applied.`)
    }
    this.plugins.set(plugin.name, plugin)
    this.onApply(plugin)
    return this
  }

  protected abstract onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<In, Out, Parameters>
  ): void

  public start() {
    this.requireNotStarted()
    this.started = true
    this.onStart()
  }

  protected abstract onStart(): void

  private requireNotStarted() {
    if (this.started) {
      throw new Error('PluginAdapter has already been started.')
    }
  }
}
