export type ResolveCQRSEvent = {
  aggregateId: string
  aggregateVersion: number
  type: string
  payload: Record<string, any>
  timestamp: number,
  streamIds?: Record<string, number>
}

export type ResolveRawEvent = {
  streamIds: Record<string, number>
  type: string
  payload: Record<string, any>
  timestamp: number,
}

export type ResolveEvent = ResolveCQRSEvent | ResolveRawEvent

export const isResolveCQRSEvent = (event:ResolveEvent): event is ResolveCQRSEvent =>
  (event as any).aggregateId != null

export const isResolveRawEvent = (event:ResolveEvent): event is ResolveRawEvent =>
  (event as any).aggregateId == null

export type DynamoDBEvent = {
  eventStoreId: {
    S: string
  }
  primaryKey: {
    S: string
  }
  secondaryKey: {
    N: string
  }
  streamId: {
    S: string
  }
  streamVersion: {
    N: string
  }
  type: {
    S: string
  }
  payload: {
    S: string
  }
  timestamp: {
    N: string
  }
  requestId: {
    S: string
  }
}
