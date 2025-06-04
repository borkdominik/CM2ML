import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { getMostSimilarWord } from '@cm2ml/nlp-utils'
import { ExecutionError, ValidationError, getTypeConstructor } from '@cm2ml/plugin'
import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { PluginAdapter } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import cors from '@fastify/cors'
import { Stream } from '@yeger/streams'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fastify } from 'fastify'

class Server extends PluginAdapter<string[], StructuredOutput<unknown[], unknown>> {
  private readonly server = fastify()
  private finalized = false

  private readonly EMBEDDINGS_BASE_DIR = path.join(import.meta.dirname, '../../../../embeddings/')
  private readonly SUPPORTED_MODELS: Record<string, string> = {
    'glove': 'glove-6B-300d.txt',
    'word2vec-google-news': 'word2vec-google-news-300.txt',
    'glove-mde': 'glove-mde.txt',
    'word2vec-mde': 'word2vec-mde.txt',
  }

  private readonly embeddingsIndexCache: Map<string, Map<string, number>> = new Map()

  public constructor() {
    super()
    this.loadAllEmbeddingsIndexes()
  }

  protected onApply<Parameters extends ParameterMetadata>(
    plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  ) {
    this.server.post(`/plugins/${plugin.name}`, async (request, reply) =>
      pluginRequestHandler(plugin, request, reply))
  }

  protected onStart() {
    this.finalize()

    this.server.listen(
      { port: +(process.env.PORT ?? 8080) },
      (err, address) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }
        // eslint-disable-next-line no-console
        console.log(`Server listening at ${address}`)
      },
    )
  }

  /**
   * Finalizes the server configuration.
   * @returns The server instance.
   */
  protected finalize() {
    if (this.finalized) {
      throw new Error('Server already finalized.')
    }
    this.finalized = true
    const plugins = Stream.from(this.plugins.values())
      .map((plugin) => ({
        name: plugin.name,
        parameters: plugin.parameters,
      }))
      .toArray()

    this.server.get('/plugins', async (_request, reply) => {
      reply.statusCode = 200
      return plugins
    })

    this.server.get('/health', (_request, reply) => {
      reply.statusCode = 200
      return { appliedPlugins: plugins.length }
    })

    this.server.register(cors, { origin: '*' })

    this.server.get('/embedding/:model/:term', async (request: FastifyRequest, reply: FastifyReply) => {
      const { model, term } = request.params as { model: string, term: string }

      // Validate model selection
      if (!this.SUPPORTED_MODELS[model]) {
        reply.statusCode = 400
        return { error: `Unsupported embedding model. Available models: ${Object.keys(this.SUPPORTED_MODELS).join(', ')}` }
      }

      const embedding = this.getEmbedding(model, term)
      if (embedding) {
        reply.statusCode = 200
        return { model, term, embedding }
      } else {
        reply.statusCode = 404
        return { error: 'Embedding not found' }
      }
    })

    this.server.get('/embedding/:model/:term/similar', async (request, reply) => {
      const { model, term } = request.params as { model: string, term: string }
      if (!this.SUPPORTED_MODELS[model]) {
        reply.statusCode = 400
        return { error: `Unsupported model. Available: ${Object.keys(this.SUPPORTED_MODELS).join(', ')}` }
      }
      const result = this.getMostSimilarWordEmbedding(model, term)
      if (result) {
        reply.statusCode = 200
        return result
      } else {
        reply.statusCode = 404
        return { error: 'No similar word found' }
      }
    })

    this.server.post('/pooled', async (request: FastifyRequest, reply: FastifyReply) => {
      const { vectors, poolingType } = request.body as { vectors: number[][], poolingType: string }

      if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
        reply.statusCode = 400
        return { error: 'Invalid input: vectors must be a non-empty array.' }
      }

      if (!['mean', 'max'].includes(poolingType)) {
        reply.statusCode = 400
        return { error: 'Invalid pooling type. Must be "max" or "avg".' }
      }

      const dimension = vectors[0]?.length
      if (!dimension) {
        reply.statusCode = 400
        return { error: 'Invalid input: vectors must be non-empty arrays.' }
      }

      if (!vectors.every((vec) => vec.length === dimension)) {
        reply.statusCode = 400
        return { error: 'All vectors must have the same dimensionality.' }
      }

      const pooledVector = poolingType === 'mean'
        ? Array.from({ length: dimension }, (_, i) => vectors.reduce((sum, vec) => sum + vec[i]!, 0) / vectors.length)
        : Array.from({ length: dimension }, (_, i) => Math.max(...vectors.map((vec) => vec[i]!)))

      reply.statusCode = 200
      return { pooledVector }
    })

    return this.server
  }

  private loadAllEmbeddingsIndexes() {
    for (const [model, fileName] of Object.entries(this.SUPPORTED_MODELS)) {
      const indexFilePath = `${this.EMBEDDINGS_BASE_DIR}${fileName.replace('.txt', '_index.txt')}`
      const indexMap = this.loadEmbeddingsIndex(indexFilePath)
      this.embeddingsIndexCache.set(model, indexMap)
    }
  }

  private loadEmbeddingsIndex(indexFilePath: string): Map<string, number> {
    const index: Map<string, number> = new Map()
    try {
      const data = fs.readFileSync(indexFilePath, 'utf8').split('\n')
      for (const line of data) {
        const [word, offset] = line.split(' ')
        if (word && offset) {
          index.set(word, Number(offset))
        }
      }
      // eslint-disable-next-line no-console
      console.log(`Loaded embeddings index from ${indexFilePath}`)
    } catch (error) {
      console.error(`Failed to load embeddings index from ${indexFilePath}:`, error)
    }
    return index
  }

  /**
   * Retrieves an embedding for a given term.
   */
  private getEmbedding(model: string, term: string): number[] | null {
    const index = this.embeddingsIndexCache.get(model)
    if (!index) {
      return null
    }

    const offset = index.get(term)
    if (offset === undefined) {
      return null
    }

    const embeddingFilePath = `${this.EMBEDDINGS_BASE_DIR}${this.SUPPORTED_MODELS[model]}`

    try {
      const buffer = Buffer.alloc(4096) // Read up to 4 KB
      const fd = fs.openSync(embeddingFilePath, 'r')
      fs.readSync(fd, buffer, 0, buffer.length, offset)
      fs.closeSync(fd)

      const fullLine = buffer.toString('utf8').split('\n')[0]
      const parts = fullLine?.trim().split(/\s+/)
      if (!parts || parts.length < 2 || parts[0] !== term) {
        return null
      }

      return parts.slice(1).map(Number)
    } catch (error) {
      console.error(`Error reading embedding for term '${term}' from ${embeddingFilePath}:`, error)
      return null
    }
  }

  private getMostSimilarWordEmbedding(model: string, term: string): { word: string, embedding: number[] } | null {
    const index = this.embeddingsIndexCache.get(model)
    if (!index) {
      return null
    }

    const mostSimilarWord = getMostSimilarWord(term, index)
    if (!mostSimilarWord) {
      return null
    }

    const embedding = this.getEmbedding(model, mostSimilarWord)
    if (!embedding) {
      return null
    }

    return { word: mostSimilarWord, embedding }
  }
}

type ValidatedRequestBody = Record<string, string> & { input: string[] }

function isValidRequestBody(
  body: unknown,
): body is ValidatedRequestBody {
  if (typeof body !== 'object' || !body || !('input' in body)) {
    return false
  }
  const input = body.input
  if (!Array.isArray(input)) {
    return false
  }
  if (input.length === 0) {
    return false
  }
  if (!input.every((item) => typeof item === 'string')) {
    return false
  }
  return true
}

function pluginRequestHandler<Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body
    if (!isValidRequestBody(body)) {
      reply.statusCode = 422
      return {
        error: 'Invalid request body',
      }
    }

    const parameters = getParametersFromBody(body, plugin.parameters)
    const output = plugin.validateAndInvoke(body.input, parameters)

    reply.statusCode = 200
    return output
  } catch (error) {
    if (error instanceof ValidationError) {
      reply.statusCode = 422
      return {
        error: error.message,
      }
    }
    if (error instanceof ExecutionError) {
      reply.statusCode = 400
      return {
        error: error.message,
      }
    }
    reply.statusCode = 500
    return {
      error: getMessage(error),
    }
  }
}

function getParametersFromBody(body: ValidatedRequestBody, parameters: ParameterMetadata) {
  return Stream.fromObject(parameters)
    .map(([key, { defaultValue, type }]) => {
      const typeConstructor = getTypeConstructor(type)
      const provided = body[key]
      const value =
        provided !== undefined ? typeConstructor(provided) : defaultValue
      return {
        key,
        value,
      }
    })
    .toRecord(
      ({ key }) => key,
      ({ value }) => value,
    )
}

export function createServer() {
  return new Server()
}
