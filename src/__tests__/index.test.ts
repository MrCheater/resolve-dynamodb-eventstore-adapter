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

  const eventsTableName = 'events'

  await init({ client, eventsTableName })

  for(let eventIndex = 0; eventIndex < 10; eventIndex++) {
    const requestId = `${Math.floor(Math.random()*100000)}`.padStart(5, '0')
    const event: ResolveEvent = {
      eventStoreId,
      requestId,
      aggregateId: 'id1',
      aggregateVersion: 1,
      type: 'QQQ',
      payload: {
        value: 42,
      },
      timestamp: new Date(eventIndex).getTime(),
    }

    await saveEvent({ client, eventsTableName }, event)
  }

  const startTime = new Date(5).getTime()

  console.log('load all events')
  await loadAllEvents({ client, eventsTableName }, eventStoreId)

  console.log('load half events')
  await loadAllEvents({ client, eventsTableName }, eventStoreId, startTime)
})
