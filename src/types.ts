export type ResolveEvent = {
  requestId: string
  eventStoreId: string
  tenantId: string
  aggregateId: string
  aggregateVersion: number
  type: string
  payload: Record<string, any>
  timestamp: number
  streamIds?: Array<string>
}
