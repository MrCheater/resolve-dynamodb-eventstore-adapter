import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from '../types'

import init from '../init'
import saveEvent from '../save-event'
import loadAllEvents from '../load-all-events'
import getRandomRequestId from '../get-random-request-id'

test('wip', async () => {
  const client = new DynamoDBClient({
    region: 'test',
    endpoint: { hostname: 'localhost', port: 8000, path: '/', protocol: 'http' },
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    },
  })

  const eventStoreIds = ['000001', '000002'] as const

  const eventsTableName = 'events'
  const streamsTableName = 'streams'

  await init({ client, eventsTableName, streamsTableName })

  for (let eventIndex = 0; eventIndex < 1; eventIndex++) {
    const requestId = getRandomRequestId()
    const eventStoreId = eventIndex % 2 === 0 ? eventStoreIds[0] : eventStoreIds[1]
    const event: ResolveEvent = {
      eventStoreId,
      requestId,
      aggregateId: 'id1',
      aggregateVersion: 1 + eventIndex,
      type: 'QQQ',
      payload: {
        value: 42,
      },
      timestamp: new Date(eventIndex).getTime(),
    }

    await saveEvent({ client, eventsTableName, streamsTableName }, event)
  }

  console.log('load all events')
  await loadAllEvents({ client, eventsTableName, streamsTableName })
})
