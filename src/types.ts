export type ResolveEvent = {
  aggregateId: string
  aggregateVersion: number
  type: string
  payload: Record<string, any>
  timestamp: number
}

export type DynamoDBEvent = {
  primaryKey: {
    S: string
  }
  aggregateId: {
    S: string
  }
  aggregateVersion: {
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
