import { DynamoDB, ListTablesCommand } from '@aws-sdk/client-dynamodb'

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

  await client.createTable({
    TableName: 'events',
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_IMAGE',
    },
    AttributeDefinitions: [
      { AttributeName: 'index', AttributeType: 'S' },
      { AttributeName: 'type', AttributeType: 'S' },
      { AttributeName: 'payload', AttributeType: 'S' },
      { AttributeName: 'aggregateId', AttributeType: 'S' },
      { AttributeName: 'aggregateVersion', AttributeType: 'N' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    KeySchema: [
      {
        AttributeName: 'index',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'aggregateVersion',
        KeyType: 'RANGE',
      },
    ],
  })

  const event = {
    aggregateId: 'id1',
    aggregateVersion: 1,
    type: 'QQQ',
    payload: {
      value: 42,
    },
    timestamp: Date.now(),
  }

  console.log('putItem start')
  await client.putItem({
    TableName: eventsTableName,
    Item: {
      index: {
        S: (new Date(event.timestamp).toISOString() + Math.random()).replace(/[\.:]/g, '-'),
      },
      aggregateId: {
        S: event.aggregateId,
      },
      aggregateVersion: {
        N: `${event.aggregateVersion}`,
      },
      type: {
        S: event.type,
      },
      payload: {
        S: JSON.stringify(event.payload),
      },
      timestamp: {
        N: `${event.timestamp}`,
      },
    },
  })
  console.log('putItem end')

  console.log(
    await client.query({
      TableName: eventsTableName,
    })
  )
})
