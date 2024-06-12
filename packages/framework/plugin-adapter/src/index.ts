import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export type SupportedPlugin<In, Out> = Plugin<In, Out, ParameterMetadata>

export abstract class PluginAdapter<In, Out> {
  protected plugins = new Map<string, Plugin<In, Out, any>>()

  private started = false

  /**
   *
   * Use {@link apply} for per-plugin configurations.
   */
  public applyAll(plugins: SupportedPlugin<In, Out>[]) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply(
    plugin: SupportedPlugin<In, Out>,
  ): PluginAdapter<In, Out> {
    this.requireNotStarted()
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already applied.`)
    }
    this.plugins.set(plugin.name, plugin)
    this.onApply(plugin)
    return this
  }

  protected abstract onApply<Parameters extends ParameterMetadata>(
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

export function groupStructuredOutput<Out>(output: StructuredOutput<(Out | ExecutionError)[], unknown>) {
  const withIndex = output.data.map((value, index) => ({ value, index }))
  const errors = withIndex.filter(({ value }) => value instanceof ExecutionError).map(({ value, index }) => ({ error: value as ExecutionError, index }))
  const results = withIndex.filter(({ value }) => !(value instanceof ExecutionError)).map(({ value, index }) => ({ result: value as Out, index }))
  return { errors, results, metadata: output.metadata }
}
