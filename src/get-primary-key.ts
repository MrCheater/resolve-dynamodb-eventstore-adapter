import type { ResolveEvent } from './types'

const ISORegExp = /[.:]/g

const getPrimaryKey = (event: ResolveEvent) =>
  `${new Date(event.timestamp).toISOString().replace(ISORegExp, '-')}-${event.eventStoreId}-${event.requestId}`

export default getPrimaryKey
