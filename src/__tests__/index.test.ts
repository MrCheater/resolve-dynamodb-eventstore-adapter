import { DynamoDB } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from '../types'

import init from '../init'
import saveEvent from '../save-event'
import loadAllEvents from '../load-all-events'

test('wip', async () => {
  const client = new DynamoDB({
    region: 'test',
    endpoint: { hostname: 'localhost', port: 8000, path: '/', protocol: 'http' },
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    },
  })

  const results = await client.listTables({})

  expect(results?.TableNames).toEqual([])

  const eventsTableName = 'events'

  await init({ client, eventsTableName })

  const event: ResolveEvent = {
    aggregateId: 'id1',
    aggregateVersion: 1,
    type: 'QQQ',
    payload: {
      value: 42,
    },
    timestamp: Date.now(),
  }

  await saveEvent({ client, eventsTableName }, event)

  await loadAllEvents({ client, eventsTableName })
})
