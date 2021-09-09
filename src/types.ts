export type ResolveEvent = {
  aggregateId: string
  aggregateVersion: number
  type: string
  payload: Record<string, any>
  timestamp: number,
  streamIds?: Record<string, number>
} | {
  streamIds: Record<string, number>
  type: string
  payload: Record<string, any>
  timestamp: number,
}

export type DynamoDBEvent = {
  primaryKey: {
    S: string
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
}
