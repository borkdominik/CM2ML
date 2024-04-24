import process from 'node:process'

import { ExecutionError, ValidationError, getTypeConstructor } from '@cm2ml/plugin'
import type { METADATA_KEY, ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { PluginAdapter } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fastify } from 'fastify'

class Server extends PluginAdapter<string> {
  private readonly server = fastify()

  protected onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<string, Out, Parameters>,
  ) {
    this.server.post(`/encoders/${plugin.name}`, async (request, reply) =>
      pluginRequestHandler(plugin, request, reply))
  }

  protected onApplyBatched<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<string[], { data: Out[], [METADATA_KEY]: unknown }, Parameters>,
  ) {
    this.server.post(`/encoders/${plugin.name}`, async (request, reply) =>
      batchedPluginRequestHandler(plugin, request, reply))
  }

  protected onStart() {
    const plugins = Stream.from(this.plugins.values())
      .map((plugin) => ({
        name: plugin.name,
        parameters: plugin.parameters,
      }))
      .toArray()

    this.server.get('/encoders', async (_request, reply) => {
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

type ValidatedRequestBody<Batched> = Record<string, string> & { input: (Batched extends true ? string[] : string) }

function isValidRequestBody<Batched extends boolean>(
  body: unknown,
  batched: Batched,
): body is ValidatedRequestBody<Batched> {
  if (typeof body !== 'object' || !body || !('input' in body)) {
    return false
  }
  const input = body.input

  if (typeof input !== 'string') {
    return false
  }

  if (!batched) {
    // If not in batched-mode, the input must be a plain string and we're done
    return true
  }

  const parsedInput: unknown = JSON.parse(input)
  if (!Array.isArray(parsedInput)) {
    return false
  }
  if (input.length === 0) {
    return false
  }
  if (!parsedInput.every((item) => typeof item === 'string')) {
    return false
  }
  // Store the parsed input in the body object for later use
  body.input = parsedInput
  return true
}

function pluginRequestHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<string, Out, Parameters>,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body
    if (!isValidRequestBody(body, false)) {
      reply.statusCode = 422
      return {
        error: 'Invalid request body',
      }
    }

    const parameters = getParametersFromBody(body, plugin.parameters)
    const result = plugin.validateAndInvoke(body.input, parameters)
    reply.statusCode = 200
    return result
  } catch (error) {
    if (error instanceof ValidationError) {
      reply.statusCode = 422
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

function batchedPluginRequestHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], { data: Out[], [METADATA_KEY]: unknown }, Parameters>,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body
    if (!isValidRequestBody(body, true)) {
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

function getParametersFromBody(body: ValidatedRequestBody<boolean>, parameters: ParameterMetadata) {
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
