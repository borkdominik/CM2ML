import { defineStructuredPlugin } from '@cm2ml/plugin'
import { describe, expect, it } from 'vitest'

import { createServer } from '../src'

type TestPlugin = Parameters<ReturnType<typeof createServer>['applyAll']>[0][number]

function getTestServer(plugins: TestPlugin[]) {
  const server = createServer()
  server.applyAll(plugins)
  // Call the protected method illegally
  return (server as any).finalize()
}

const testPluginA = defineStructuredPlugin({
  name: 'a',
  parameters: {
    value: { type: 'string', description: 'value', defaultValue: 'fix' },
    location: { type: 'string', description: 'location', defaultValue: 'prefix', allowedValues: ['prefix', 'postfix'] },
  },
  invoke(input: string[], parameters) {
    return {
      data: input.map((entry) => parameters.location === 'prefix' ? `${parameters.value}-${entry}` : `${entry}-${parameters.value}`),
      metadata: parameters,
    }
  },
})

const testPluginB = defineStructuredPlugin({
  name: 'b',
  parameters: {
    flag: { type: 'boolean', description: 'flag', defaultValue: false },
    int: { type: 'number', description: 'int', defaultValue: 42 },
    float: { type: 'number', description: 'float', defaultValue: 3.14 },
    list: { type: 'list<string>', description: 'list', defaultValue: ['a', 'b'] },
    set: { type: 'list<string>', description: 'ordered', ordered: false, unique: true, defaultValue: ['a', 'b'], allowedValues: ['a', 'b', 'c'] },
    ordered: { type: 'list<string>', description: 'ordered', ordered: true, unique: true, defaultValue: ['a', 'b'], allowedValues: ['a', 'b', 'c'] },
  },
  invoke(input: string[], parameters) {
    return { data: input, metadata: parameters }
  },
})

const testPlugins = [testPluginA, testPluginB] as unknown[] as TestPlugin[]

describe('REST adapter', () => {
  describe('/health', () => {
    describe('GET', () => {
      it('includes the number of applied plugins', async () => {
        const server = getTestServer(testPlugins)
        const response = await server.inject({ method: 'GET', url: '/health' })
        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ appliedPlugins: 2 })
      })
    })
  })

  describe('/plugins', () => {
    describe('GET', () => {
      it('returns the plugins and their metadata', async () => {
        const server = getTestServer(testPlugins)
        const response = await server.inject({ method: 'GET', url: '/plugins' })
        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual([
          {
            name: 'a',
            parameters: {
              ...testPluginA.parameters,
            },
          },
          {
            name: 'b',
            parameters: {
              ...testPluginB.parameters,
            },
          },
        ])
      })
    })

    describe('/plugins/:pluginName', () => {
      describe('POST', () => {
        it('returns the plugins output', async () => {
          const server = getTestServer(testPlugins)
          const response = await server.inject({
            method: 'POST',
            url: `/plugins/${testPluginA.name}`,
            body: {
              input: ['hello', 'world'],
            },
          })
          expect(response.statusCode).toBe(200)
          expect(response.json()).toEqual({
            data: [
              'fix-hello',
              'fix-world',
            ],
            metadata: {
              value: 'fix',
              location: 'prefix',
            },
          })
        })

        it('returns 404 if the plugin does not exist', async () => {
          const server = getTestServer(testPlugins)
          const response = await server.inject({ method: 'POST', url: '/plugins/c' })
          expect(response.statusCode).toBe(404)
        })

        it('returns 422 if the request body is invalid', async () => {
          const server = getTestServer(testPlugins)
          const response = await server.inject({
            method: 'POST',
            url: `/plugins/${testPluginA.name}`,
            body: {
              input: 'foo',
            },
          })
          expect(response.statusCode).toBe(422)
        })

        it('returns 422 if the request body is missing', async () => {
          const server = getTestServer(testPlugins)
          const response = await server.inject({
            method: 'POST',
            url: `/plugins/${testPluginA.name}`,
          })
          expect(response.statusCode).toBe(422)
        })

        describe('with parameters', () => {
          it('can configure string parameters', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginA.name}`,
              body: {
                input: ['hello', 'world'],
                value: 'foo',
                location: 'postfix',
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual({
              data: [
                'hello-foo',
                'world-foo',
              ],
              metadata: {
                value: 'foo',
                location: 'postfix',
              },
            })
          })

          it('can configure boolean parameters to true', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                flag: true,
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.flag).toEqual(true)
          })

          it('can configure boolean parameters to false', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                flag: false,
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.flag).toEqual(false)
          })

          it('can configure numeric parameters', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                int: 23,
                float: 2.71,
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.int).toEqual(23)
            expect(response.json().metadata.float).toEqual(2.71)
          })

          it('can configure list parameters', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                list: ['foo', 'bar', 'foo'],
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.list).toEqual(['bar', 'foo', 'foo'])
          })

          it('can configure set parameters', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                set: ['c', 'a', 'b', 'a'],
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.set).toEqual(['a', 'b', 'c'])
          })

          it('can configure ordered parameters', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginB.name}`,
              body: {
                input: ['hello', 'world'],
                ordered: ['c', 'a', 'b', 'a'],
              },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().metadata.ordered).toEqual(['c', 'a', 'b'])
          })

          it('returns 422 if the parameters are invalid', async () => {
            const server = getTestServer(testPlugins)
            const response = await server.inject({
              method: 'POST',
              url: `/plugins/${testPluginA.name}`,
              body: {
                input: ['hello', 'world'],
                location: 'invalid',
              },
            })
            expect(response.statusCode).toBe(422)
          })
        })
      })
    })
  })
})
