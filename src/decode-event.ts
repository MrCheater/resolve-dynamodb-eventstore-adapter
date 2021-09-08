import type { DynamoDBEvent, ResolveEvent } from './types'

const decodeEvent = (item: DynamoDBEvent): ResolveEvent => ({
  aggregateId: item.aggregateId.S,
  aggregateVersion: +item.aggregateVersion.N,
  type: item.type.S,
  payload: JSON.parse(item.payload.S),
  timestamp: +item.timestamp.N,
})

export default decodeEvent
