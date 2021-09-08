import type { DynamoDB } from '@aws-sdk/client-dynamodb'

const init = async (pool: { client: DynamoDB; eventsTableName: string }) => {
  const { client, eventsTableName } = pool

  await client.createTable({
    TableName: eventsTableName,
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
}

export default init
