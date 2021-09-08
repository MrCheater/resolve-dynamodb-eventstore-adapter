import { DynamoDB, AttributeValue } from '@aws-sdk/client-dynamodb'
//
// const expressionString = (...strings: Array<string>) => {
//   const expression = strings
//     .filter((str) => str)
//     .join(' AND ')
//     .trim()
//   return expression === '' ? undefined : expression
// }
//
// const expressionObject = (...objects: Array<object>) => {
//   const expression = Object.create(null)
//   Object.assign(expression, ...objects)
//   return Object.keys(expression).length === 0 ? undefined : expression
// }

type Event = {
  aggregateId: string
  aggregateVersion: number
  type: string
  payload: Record<string, any>
  timestamp: number
}

type DynamoDBEvent = {
  primaryKey: {
    S: string
  }
  aggregateId: {
    S: string
  }
  aggregateVersion: {
    N: string
  }
  type: {
    S: string
  }
  payload: {
    S: string
  }
  timestamp: {
    N: string
  }
}

const getPrimaryKey = (event: Event) =>
  `${new Date(event.timestamp).toISOString().replace(ISORegExp, '-')}-${event.aggregateId}-${
    event.aggregateVersion
  }`

const ISORegExp = /[.:]/g
const encodeEvent = (event: Event): DynamoDBEvent => ({
  primaryKey: {
    S: getPrimaryKey(event),
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
})

const decodeEvent = (item: DynamoDBEvent): Event => ({
  aggregateId: item.aggregateId.S,
  aggregateVersion: +item.aggregateVersion.N,
  type: item.type.S,
  payload: JSON.parse(item.payload.S),
  timestamp: +item.timestamp.N,
})

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
      { AttributeName: 'primaryKey', AttributeType: 'S' },
      // { AttributeName: 'type', AttributeType: 'S' },
      // { AttributeName: 'payload', AttributeType: 'S' },
      // { AttributeName: 'aggregateId', AttributeType: 'S' },
      { AttributeName: 'aggregateVersion', AttributeType: 'N' },
      // { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    KeySchema: [
      {
        AttributeName: 'primaryKey',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'aggregateVersion',
        KeyType: 'RANGE',
      },
    ],
  })

  const event: Event = {
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
    Item: encodeEvent(event),
  })
  console.log('putItem end')

  const loadAllEvents = async () => {
    let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined
    do {
      const result: any = await client.scan({
        TableName: eventsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
      })
      const { Items, LastEvaluatedKey } = result
      console.log(...Items.map(decodeEvent))
      PrevLastEvaluatedKey = LastEvaluatedKey
    } while (PrevLastEvaluatedKey !== undefined)
  }

  await loadAllEvents()
})
