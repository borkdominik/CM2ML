import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export interface PluginAdapterConfiguration {
  batched: boolean
}

export type SupportedPlugin<In> = Plugin<In, unknown, ParameterMetadata> | Plugin<In[], unknown[], ParameterMetadata>

export abstract class PluginAdapter<In, Configuration extends PluginAdapterConfiguration = PluginAdapterConfiguration> {
  protected plugins = new Map<string, Plugin<In, unknown, any> | Plugin<In[], unknown[], any>>()

  private started = false

  /**
   *
   * Use {@link apply} for per-plugin configurations.
   */
  public applyAll(plugins: SupportedPlugin<In>[], configuration: Configuration) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin, configuration))
    return this
  }

  public apply(
    plugin: SupportedPlugin<In>,
    configuration: Configuration,
  ): PluginAdapter<In, Configuration> {
    this.requireNotStarted()
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already applied.`)
    }
    this.plugins.set(plugin.name, plugin)
    if (configuration.batched) {
      this.onApplyBatched(plugin as Plugin<In[], unknown[], ParameterMetadata>, configuration)
      return this
    }
    this.onApply(plugin as Plugin<In, unknown, ParameterMetadata>, configuration)
    return this
  }

  protected abstract onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<In, Out, Parameters>,
    configuration: Configuration,
  ): void

  protected abstract onApplyBatched<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<In[], Out[], Parameters>,
    configuration: Configuration,
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
