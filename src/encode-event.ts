import type { DynamoDBEvent, ResolveEvent } from './types'

import getPrimaryKey from './get-primary-key'

const encodeEvent = (event: ResolveEvent): DynamoDBEvent => ({
  primaryKey: {
    S: getPrimaryKey(event),
  },
  aggregateId: {
    S: event.aggregateId,
  },
  aggregateVersion: {
    N: `${event.aggregateVersion}`,
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
})

export default encodeEvent
