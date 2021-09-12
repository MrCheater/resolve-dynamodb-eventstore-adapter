const ISORegExp = /[.:]/g

const createCursor = (event: { timestamp: number; eventStoreId: string; requestId: string }) =>
  `${event.eventStoreId}-${new Date(event.timestamp).toISOString().replace(ISORegExp, '-')}-${
    event.requestId
  }`

export default createCursor
