import type { DynamoDBEvent, ResolveEvent, isResolveCQRSEvent, isResolveRawEvent } from './types'

import getPrimaryKey from './get-primary-key'

const encodeEvent = (event: ResolveEvent): Array<DynamoDBEvent> => {
  const items: Array<DynamoDBEvent> = []

  const primaryKey = getPrimaryKey(event)
  const streamId = 'streamId'

  const item: DynamoDBEvent = {
    eventStoreId: {
      S: event.eventStoreId,
    },
    primaryKey: {
      S: getPrimaryKey(event),
    },

    streamId: {
      S: streamId,
    },
    streamVersion: {
      N: `${(event as any).streamIds[streamId]}`,
    },
    type: {
      S: event.type,
    },
    payload: {
      S: JSON.stringify(event.payload),
    },
    timestamp: {
      N: `${event.timestamp}`,
    },
    requestId: {
      S: event.requestId,
    },
  }

  return items
}

export default encodeEvent
