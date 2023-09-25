import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { getTypeConstructor } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { fastify } from 'fastify'

class Server {
  private readonly server = fastify()

  private readonly plugins: Plugin<unknown, ParameterMetadata>[] = []

  public applyAll<Out, Parameters extends ParameterMetadata>(
    plugins: Plugin<Out, Parameters>[]
  ) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<Out, Parameters>
  ) {
    this.plugins.push(plugin)
    this.server.post(`/encoders/${plugin.name}`, async (request, _reply) => {
      // TODO: Status codes
      const body = request.body
      if (!validateRequestBody(body)) {
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

      const validationResult = plugin.validate(options)
      if (!validationResult.success) {
        return {
          error: {
            message: validationResult.error.message,
          },
        }
      }
      const result = plugin.invoke(body.input, validationResult.data)
      return {
        result,
      }
    })
    return this
  }

  public start() {
    // TODO: Prevent duplicate start
    this.server.get('/encoders', async (_request, _reply) => {
      return this.plugins.map((plugin) => ({
        name: plugin.name,
        parameters: plugin.parameters,
      }))
    })

    this.server.listen({ port: 8080 }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      // eslint-disable-next-line no-console
      console.log(`Server listening at ${address}`)
    })
  }
}

function validateRequestBody(
  body: unknown
): body is Record<string, string> & { input: string } {
  if (typeof body !== 'object' || !body || 'input' in body === false) {
    return false
  }
  const input = body.input
  if (typeof input !== 'string') {
    return false
  }
  return true
}
export function createServer() {
  return new Server()
}
