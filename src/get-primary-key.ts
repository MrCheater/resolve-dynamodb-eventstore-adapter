import type { ResolveEvent } from './types'

const ISORegExp = /[.:]/g

const getPrimaryKey = (event: ResolveEvent, eventStoreId:string, requestId: string) =>
  `${new Date(event.timestamp).toISOString().replace(ISORegExp, '-')}-${eventStoreId}-${requestId}`

export default getPrimaryKey
