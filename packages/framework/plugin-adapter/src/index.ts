import { DUPLICATE_SYMBOL, type DuplicateSymbol } from '@cm2ml/deduplicate'
import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export type SupportedPlugin<In, Out> = Plugin<In, Out, ParameterMetadata>

export type PluginAdapterState = 'not-started' | 'starting' | 'started'

export abstract class PluginAdapter<In, Out> {
  protected plugins = new Map<string, Plugin<In, Out, any>>()

  #state: PluginAdapterState = 'not-started'

  protected get state() {
    return this.#state
  }

  private set state(value: PluginAdapterState) {
    this.#state = value
  }

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
    this.state = 'starting'
    this.onStart()
    this.state = 'started'
  }

  protected abstract onStart(): void

  private requireNotStarted() {
    if (this.state !== 'not-started') {
      throw new Error('PluginAdapter has already been started.')
    }
  }
}

export function groupStructuredOutput<Out>(output: StructuredOutput<(Out | ExecutionError | DuplicateSymbol)[], unknown>) {
  const errors: { error: ExecutionError, index: number }[] = [] // withIndex.filter(isExecutionError).map(({ value, index }) => ({ error: value as ExecutionError, index }))
  const duplicates: number[] = []// withIndex.filter(isDuplicate).map(({ index }) => index)
  const results: { result: Out, index: number }[] = []// withIndex.filter(isData).map(({ value, index }) => ({ result: value, index }))
  output.data.forEach((value, index) => {
    if (isExecutionError(value)) {
      errors.push({ error: value, index })
    } else if (isDuplicate(value)) {
      duplicates.push(index)
    } else {
      results.push({ result: value, index })
    }
  })
  return { errors, duplicates, results, metadata: output.metadata }
}

function isExecutionError<T>(value: T | ExecutionError | DuplicateSymbol): value is ExecutionError {
  return value instanceof ExecutionError
}

function isDuplicate<T>(value: T | ExecutionError | DuplicateSymbol): value is DuplicateSymbol {
  return value === DUPLICATE_SYMBOL
}
