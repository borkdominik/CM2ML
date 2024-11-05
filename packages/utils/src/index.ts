export function getMessage(error: unknown): string {
  if (error instanceof Error || containsMessage(error)) {
    return error.message
  }
  if (typeof error === 'object') {
    return JSON.stringify(error)
  }
  return String(error)
}

function containsMessage(error: unknown): error is { message: string } {
  if (typeof error !== 'object') {
    return false
  }
  if (!error) {
    return false
  }
  return 'message' in error
}

export function parseNamespace(string: string) {
  if (!string.includes(':')) {
    return string
  }
  const [namespace, ...value] = string.split(':')
  return { name: value.join(':'), namespace: namespace! }
}

/**
 * Create a lazy proxy for the given provider.
 */
export function lazy<T extends object>(initializer: () => T) {
  let value: T | undefined
  return new Proxy<T>({} as Readonly<T>, {
    get: (_target, prop) => {
      return Reflect.get(value ??= initializer(), prop)
    },
    has: (_target, prop) => {
      return Reflect.has(value ??= initializer(), prop)
    },
  })
}
