import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

const init = async (pool: { client: DynamoDBClient; eventsTableName: string }) => {
  const { client, eventsTableName } = pool

  const command = new CreateTableCommand({
    TableName: eventsTableName,
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_IMAGE',
    },
    AttributeDefinitions: [
      { AttributeName: 'eventStoreId', AttributeType: 'S' },
      //{ AttributeName: 'primaryKey', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    KeySchema: [
      {
        AttributeName: 'eventStoreId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE',
      },
    ],
  })

  await client.send(command)
}

export default init
