import type { DynamoDBEvent, ResolveEvent } from './types'

const decodeEvent = (item: any): ResolveEvent => {
  try {
    const event: DynamoDBEvent = item

    const type = event.type.S
    const payload = JSON.parse(event.payload.S)
    const aggregateId = event.aggregateId.S

    const aggregateVersion = parseInt(event.aggregateVersion.N, 10)
    const timestamp = parseInt(event.timestamp.N, 10)

    if (
      Number.isNaN(aggregateVersion) ||
      aggregateVersion.toString() !== event.aggregateVersion.N
    ) {
      throw new TypeError()
    }

    if (Number.isNaN(timestamp) || timestamp.toString() !== event.timestamp.N) {
      throw new TypeError()
    }

    return {
      aggregateId,
      aggregateVersion,
      type,
      payload,
      timestamp,
    }
  } catch {
    throw new Error(`Incorrect event: ${JSON.stringify(item)}`)
  }
}

export default decodeEvent
