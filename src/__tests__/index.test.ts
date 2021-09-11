import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from '../types'

import init from '../init'
import saveEvent from '../save-event'
import loadAllEvents from '../load-all-events'

test('wip', async () => {
  const client = new DynamoDBClient({
    region: 'test',
    endpoint: { hostname: 'localhost', port: 8000, path: '/', protocol: 'http' },
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    },
  })

  const eventStoreId = '00001'
  const requestId = '00002'
  const eventsTableName = 'events'

  await init({ client, eventsTableName })

  const event: ResolveEvent = {
    eventStoreId,
    requestId,
    aggregateId: 'id1',
    aggregateVersion: 1,
    type: 'QQQ',
    payload: {
      value: 42,
    },
    timestamp: Date.now(),
  }

  await saveEvent({ client, eventsTableName }, event)

  await loadAllEvents({ client, eventsTableName }, eventStoreId)

  await saveEvent({ client, eventsTableName }, event)

  await loadAllEvents({ client, eventsTableName }, eventStoreId)
})
