import { ResolveEvent } from './types'

class ConcurrentError extends Error {
  constructor(event: ResolveEvent) {
    let message = `Cannot save the event because the `
    const streamIds = Object.keys(event.streamIds ?? {})
    const streamCount = streamIds.length

    const streamMessage =
      streamCount === 0
        ? ``
        : streamCount === 1
        ? `stream "${streamIds[0]}"`
        : `streams ${streamIds.map((streamId) => `"${streamId}"`).concat(', ')}`

    message += `aggregate "${event.aggregateId}"`
    if (streamCount > 0) {
      message += `or ${streamMessage} are`
    }

    message += ` currently out of date. Please retry later.`

    super(message)
    this.name = 'ConcurrentError'
  }
  static is(error: Error): boolean {
    return error.name === 'ConcurrentError'
  }
}

export default ConcurrentError
