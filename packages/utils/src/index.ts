export function getMessage(error: unknown): string {
  if (error instanceof Error || containsMessage(error)) {
    return error.message
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
