import type { DynamoDBEvent, ResolveEvent, isResolveCQRSEvent, isResolveRawEvent } from './types'

import getPrimaryKey from './get-primary-key'

const encodeEvent = (event: ResolveEvent, eventStoreId: string, requestId: string): Array<DynamoDBEvent> => {
  const items: Array<DynamoDBEvent> = []

  const primaryKey = getPrimaryKey(event, eventStoreId, requestId)
  const secondaryKey = 0
  const streamId = 'streamId'

  const item: DynamoDBEvent = {
    eventStoreId: {
      S: eventStoreId,
    },
    primaryKey: {
      S: getPrimaryKey(event, eventStoreId, requestId),
    },
    secondaryKey: {
      N: `${secondaryKey}`,
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
      S: requestId
    }
  }

  return items
}

export default encodeEvent
