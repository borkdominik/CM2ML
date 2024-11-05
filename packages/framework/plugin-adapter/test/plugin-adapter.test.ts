import type { Plugin } from '@cm2ml/plugin'
import { definePlugin } from '@cm2ml/plugin'
import { describe, expect, it, vi } from 'vitest'

import { PluginAdapter } from '../src'

const testPluginA = definePlugin({
  name: 'a',
  parameters: {},
  invoke(input: string) {
    return { data: input, metadata: 'a' }
  },
})

const testPluginB = definePlugin({
  name: 'b',
  parameters: {},
  invoke(input: string) {
    return { data: input, metadata: 'b' }
  },
})

class TestPluginAdapter extends PluginAdapter<string, unknown> {
  public readonly onApplySpy = vi.fn()
  public readonly onStartSpy = vi.fn()

  protected onApply(plugin: Plugin<string, string, any>) {
    this.onApplySpy(plugin)
  }

  protected onStart() {
    this.onStartSpy(this.state)
  }

  public getInternalState() {
    return this.state
  }

  public getInternalPlugins() {
    return this.plugins
  }
}

describe('plugin adapter', () => {
  describe('application', () => {
    it('can apply a single plugin', () => {
      const adapter = new TestPluginAdapter()
      adapter.apply(testPluginA)
      expect(adapter.getInternalPlugins().size).toBe(1)
      expect(adapter.getInternalPlugins().get('a')).toBe(testPluginA)
    })

    it('cannot apply a plugin twice', () => {
      const adapter = new TestPluginAdapter()
      adapter.apply(testPluginA)
      expect(() => adapter.apply(testPluginA)).toThrowErrorMatchingInlineSnapshot(`[Error: Plugin a already applied.]`)
    })

    it('calls onApply for each plugin', () => {
      const adapter = new TestPluginAdapter()
      adapter.applyAll([testPluginA, testPluginB])
      expect(adapter.onApplySpy).toHaveBeenCalledTimes(2)
      expect(adapter.onApplySpy).toHaveBeenCalledWith(testPluginA)
      expect(adapter.onApplySpy).toHaveBeenCalledWith(testPluginB)
      expect(adapter.getInternalPlugins().size).toBe(2)
      expect(adapter.getInternalPlugins().get('a')).toBe(testPluginA)
      expect(adapter.getInternalPlugins().get('b')).toBe(testPluginB)
    })

    it('cannot apply plugins unless in not-started state', () => {
      const adapter = new TestPluginAdapter()
      adapter.start()
      expect(() => adapter.apply(testPluginA)).toThrowErrorMatchingInlineSnapshot(`[Error: PluginAdapter has already been started.]`)
    })
  })

  describe('state', () => {
    it('is not started initially', () => {
      const adapter = new TestPluginAdapter()
      expect(adapter.getInternalState()).toBe('not-started')
    })

    it('it calls onStart while starting', () => {
      const adapter = new TestPluginAdapter()
      adapter.start()
      expect(adapter.onStartSpy).toHaveBeenCalledWith('starting')
    })

    it('is started after onStart is called', () => {
      const adapter = new TestPluginAdapter()
      adapter.start()
      expect(adapter.getInternalState()).toBe('started')
    })

    it('throws when start is called twice', () => {
      const adapter = new TestPluginAdapter()
      adapter.start()
      expect(() => adapter.start()).toThrow()
    })
  })
})
