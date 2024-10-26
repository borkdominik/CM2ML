import { readFileSync, writeFileSync } from 'node:fs'

import { defineStructuredPlugin } from '@cm2ml/plugin'
import { fileSync, dirSync, setGracefulCleanup } from 'tmp'
import { afterEach, describe, expect, it, vitest } from 'vitest'

import { createCLI } from '../src'

setGracefulCleanup()

type TestPlugin = Parameters<ReturnType<typeof createCLI>['applyAll']>[0][number]

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
    positiveFlag: { type: 'boolean', description: 'negated flag', defaultValue: true },
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

const testPluginC = defineStructuredPlugin({
  name: 'c',
  parameters: {
    stringParameter: { type: 'string', description: 'file supported string', defaultValue: 'none', processFile: (fileContent) => `fromFile: ${fileContent}` },
    listParameter: { type: 'list<string>', description: 'file supported list', defaultValue: [], processFile: (fileContent) => `fromFile: ${fileContent}`, ordered: true, unique: true },
    continueOnError: { type: 'boolean', description: 'continue on error', defaultValue: false },
  },
  invoke(input: string[], parameters) {
    return { data: input, metadata: parameters }
  },
})

const testPlugins = [testPluginA, testPluginB, testPluginC] as unknown[] as TestPlugin[]

function setMockArgv(args: string[]) {
  process.argv.splice(0)
  process.argv.push(...['node', 'cli-test', ...args])
}

function runTestCli(plugins: TestPlugin[]) {
  return createCLI().applyAll(plugins).start()
}

function createTestFile() {
  const file = fileSync()
  return {
    name: file.name,
    write: (content: string) => writeFileSync(file.name, content, 'utf-8'),
    parse: () => JSON.parse(readFileSync(file.name, 'utf-8')),
  }
}

function createTestInputFile(content: string) {
  const file = createTestFile()
  file.write(content)
  return file.name
}

function createTestInputDir(content: string[]) {
  const dir = dirSync()
  content.forEach((entry, index) => {
    writeFileSync(`${dir.name}/file-${index}`, entry, 'utf-8')
  })
  return dir.name
}

function createSpies() {
  const logSpy = vitest.spyOn(console, 'log')
  const errorSpy = vitest.spyOn(console, 'error')
  const exitSpy = vitest.spyOn(process, 'exit')
  exitSpy.mockImplementation((() => {}) as any)
  return {
    getNthLog: (n: number) => logSpy.mock.calls?.[n]?.[0],
    getNthError: (n: number) => errorSpy.mock.calls?.[n]?.[0],
    getExitCode: () => exitSpy.mock.calls?.[0]?.[0] ?? 0,
  }
}

describe('CLI adapter', () => {
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('single input', () => {
    it('can run single input plugin', async () => {
      const input = createTestInputFile('hello')
      const output = createTestFile()
      setMockArgv([
        'a',
        input,
        '--out',
        output.name,
        '--location',
        'postfix',
        '--value',
        'world',
      ])

      runTestCli(testPlugins)

      expect(output.parse()).toEqual({
        data: 'hello-world',
        metadata: { value: 'world', location: 'postfix' },
      })
    })

    it('removes the continueOnError parameter', () => {
      const spies = createSpies()
      const input = createTestInputFile('hello')
      setMockArgv([
        'c',
        input,
        '--continue-on-error',
      ])

      runTestCli(testPlugins)

      expect(spies.getExitCode()).toEqual(1)
      expect(spies.getNthError(0)).toEqual('Unknown option `--continueOnError`')
    })

    describe('stdout', () => {
      it('can output to stdout for single input plugin', async () => {
        const input = createTestInputFile('hello')
        const logSpy = createSpies()
        setMockArgv([
          'a',
          input,
          '--location',
          'postfix',
          '--value',
          'world',
        ])

        runTestCli(testPlugins)

        const output = logSpy.getNthLog(0)
        const parsedOutput = JSON.parse(output)
        expect(JSON.parse(logSpy.getNthLog(0))).toEqual({
          data: 'hello-world',
          metadata: { value: 'world', location: 'postfix' },
        })
        expect(output).toEqual(`${JSON.stringify(parsedOutput)}\n`)
      })

      it('can prettify output', async () => {
        const input = createTestInputFile('hello')
        const logSpy = createSpies()
        setMockArgv([
          'a',
          input,
          '--location',
          'prefix',
          '--value',
          'good',
          '--pretty',
        ])

        runTestCli(testPlugins)

        const output = logSpy.getNthLog(0)
        expect(output).toEqual(`${JSON.stringify(JSON.parse(output), null, 2)}\n`)
      })
    })

    describe('parameters', () => {
      describe('boolean', () => {
        it('can configure boolean parameters with shorthand', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--flag',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.flag).toEqual(true)
        })

        it('can configure boolean parameters with inverted shorthand', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--no-positive-flag',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.positiveFlag).toEqual(false)
        })

        it('can configure boolean parameters to true', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--flag',
            'true',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.flag).toEqual(true)
        })

        it('can configure boolean parameters to false', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--flag',
            'false',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.flag).toEqual(false)
        })
      })

      describe('numeric', () => {
        it('can configure numeric parameters', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--int',
            '123',
            '--float',
            '3.1415',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.int).toEqual(123)
          expect(output.parse().metadata.float).toEqual(3.1415)
        })
      })

      describe('string', () => {
        it('can configure string parameters', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'a',
            input,
            '--out',
            output.name,
            '--value',
            'foo',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.value).toEqual('foo')
        })

        it('can read string from file string parameters', () => {
          const input = createTestInputFile('hello')
          const stringParameterFile = createTestFile()
          stringParameterFile.write('foo')
          const output = createTestFile()
          setMockArgv([
            'c',
            input,
            '--out',
            output.name,
            '--stringParameter',
            stringParameterFile.name,
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.stringParameter).toEqual('fromFile: foo')
        })
      })

      describe('list', () => {
        it('can configure list parameters', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--list',
            'c',
            '--list',
            'a',
            '--list',
            'c',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.list).toEqual(['a', 'c', 'c'])
        })

        it('can configure set parameters', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--set',
            'c',
            '--set',
            'a',
            '--set',
            'c',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.set).toEqual(['a', 'c'])
        })

        it('can configure ordered list parameters', () => {
          const input = createTestInputFile('hello')
          const output = createTestFile()
          setMockArgv([
            'b',
            input,
            '--out',
            output.name,
            '--ordered',
            'c',
            '--ordered',
            'a',
            '--ordered',
            'c',
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.ordered).toEqual(['c', 'a'])
        })

        it('can read string from file string parameters', () => {
          const input = createTestInputFile('hello')
          const listParameterFileFoo = createTestFile()
          listParameterFileFoo.write('foo')
          const listParameterFileBar = createTestFile()
          listParameterFileBar.write('bar')
          const output = createTestFile()
          setMockArgv([
            'c',
            input,
            '--out',
            output.name,
            '--listParameter',
            listParameterFileFoo.name,
            '--listParameter',
            'regular foo',
            '--listParameter',
            listParameterFileBar.name,
          ])

          runTestCli(testPlugins)

          expect(output.parse().metadata.listParameter).toEqual(['fromFile: foo', 'regular foo', 'fromFile: bar'])
        })
      })
    })
  })

  describe('batch input', () => {
    it('can run batch input plugin', async () => {
      const input = createTestInputDir(['day', 'night'])
      const output = createTestFile()
      setMockArgv([
        'batch-a',
        input,
        '--out',
        output.name,
        '--location',
        'prefix',
        '--value',
        'good',
      ])

      runTestCli(testPlugins)

      expect(output.parse()).toEqual({
        data: {
          'file-0': 'good-day',
          'file-1': 'good-night',
        },
        metadata: { value: 'good', location: 'prefix' },
      })
    })

    it('does not remove the continueOnError parameter', () => {
      const spies = createSpies()
      const input = createTestInputDir(['day', 'night'])
      setMockArgv([
        'batch-c',
        input,
        '--continue-on-error',
      ])

      runTestCli(testPlugins)

      expect(spies.getExitCode()).toEqual(0)
      expect(spies.getNthError(0)).toBeUndefined()
    })

    describe('stdout', () => {
      it('can output to stdout for batch input plugin', async () => {
        const input = createTestInputDir(['day', 'night'])
        const logSpy = createSpies()
        setMockArgv([
          'batch-a',
          input,
          '--location',
          'prefix',
          '--value',
          'good',
        ])

        runTestCli(testPlugins)

        const output = logSpy.getNthLog(0)
        const parsedOutput = JSON.parse(output)
        expect(parsedOutput).toEqual({
          data: {
            'file-0': 'good-day',
            'file-1': 'good-night',
          },
          metadata: { value: 'good', location: 'prefix' },
        })
        expect(output).toEqual(`${JSON.stringify(parsedOutput)}\n`)
      })

      it('can prettify output', async () => {
        const input = createTestInputDir(['day', 'night'])
        const logSpy = createSpies()
        setMockArgv([
          'batch-a',
          input,
          '--location',
          'prefix',
          '--value',
          'good',
          '--pretty',
        ])

        runTestCli(testPlugins)

        const output = logSpy.getNthLog(0)
        expect(output).toEqual(`${JSON.stringify(JSON.parse(output), null, 2)}\n`)
      })
    })

    it('can offset the start', () => {
      const input = createTestInputDir(['day', 'night'])
      const output = createTestFile()
      setMockArgv([
        'batch-a',
        input,
        '--out',
        output.name,
        '--location',
        'prefix',
        '--value',
        'good',
        '--start',
        '1',
      ])

      runTestCli(testPlugins)

      expect(output.parse()).toEqual({
        data: {
          'file-1': 'good-night',
        },
        metadata: { value: 'good', location: 'prefix' },
      })
    })

    it('can limit the input', () => {
      const input = createTestInputDir(['day', 'night'])
      const output = createTestFile()
      setMockArgv([
        'batch-a',
        input,
        '--out',
        output.name,
        '--location',
        'prefix',
        '--value',
        'good',
        '--limit',
        '1',
      ])

      runTestCli(testPlugins)

      expect(output.parse()).toEqual({
        data: {
          'file-0': 'good-day',
        },
        metadata: { value: 'good', location: 'prefix' },
      })
    })
  })
})
