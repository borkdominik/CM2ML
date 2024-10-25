import process from 'node:process'

import { ExecutionError, ValidationError, getTypeConstructor } from '@cm2ml/plugin'
import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { PluginAdapter } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fastify } from 'fastify'

class Server extends PluginAdapter<string[], StructuredOutput<unknown[], unknown>> {
  private readonly server = fastify()

  protected onApply<Parameters extends ParameterMetadata>(
    plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  ) {
    this.server.post(`/plugins/${plugin.name}`, async (request, reply) =>
      pluginRequestHandler(plugin, request, reply))
  }

  protected onStart() {
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
