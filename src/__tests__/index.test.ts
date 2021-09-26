import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from '../types'

import init from '../init'
import saveEvent from '../save-event'
import printAll from '../print-all'
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

  const eventStoreId = '000001'

  const eventsTableName = 'events'
  const aggregatesTableName = 'aggregates'
  const streamsTableName = 'streams'

  await init({ client, eventsTableName, aggregatesTableName, streamsTableName })

  for (let eventIndex = 0; eventIndex < 10; eventIndex++) {
    const requestId = getRandomRequestId()
    const event: ResolveEvent = {
      requestId,
      eventStoreId,
      tenantId: '*',
      aggregateId: 'itemId1',
      aggregateVersion: 1 + eventIndex,
      type: 'QQQ',
      payload: {
        value: 42,
      },
      timestamp: new Date(eventIndex).getTime(),
      streamIds: ['companyId1']
    }

    await saveEvent({ client, eventsTableName, aggregatesTableName, streamsTableName }, event)
  }

  console.log('load all events')
  await printAll({ client, eventsTableName, aggregatesTableName, streamsTableName })
})
