import process from 'node:process'

import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { PluginSink, getTypeConstructor } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fastify } from 'fastify'

class Server extends PluginSink {
  private readonly server = fastify()

  protected onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<Out, Parameters>
  ) {
    this.server.post(`/encoders/${plugin.name}`, async (request, reply) =>
      pluginRequestHandler(plugin, request, reply)
    )
    return this
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
      }
    )
  }
}

function validateRequestBody(
  body: unknown
): body is Record<string, string> & { input: string } {
  if (typeof body !== 'object' || !body || !('input' in body)) {
    return false
  }
  const input = body.input
  if (typeof input !== 'string') {
    return false
  }
  return true
}

function pluginRequestHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<Out, Parameters>,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body
    if (!validateRequestBody(body)) {
      reply.statusCode = 422
      return {
        error: {
          message: 'Invalid request body',
        },
      }
    }

    const options = Stream.fromObject(plugin.parameters)
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
        ({ value }) => value
      )

    const result = plugin.invoke(body.input, options)
    reply.statusCode = 200
    return {
      result,
    }
  } catch (error) {
    // TODO
    // if (error instanceof ValidationError) {
    //   reply.statusCode = 422
    // } else {
    //   reply.statusCode = 500
    // }
    return {
      error,
    }
  }
}

export function createServer() {
  return new Server()
}
