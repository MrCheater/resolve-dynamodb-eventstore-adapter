import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const init = async (pool: {
  client: DynamoDBClient
  eventsTableName: string
  aggregatesTableName: string
  streamsTableName: string
}) => {
  const { client, eventsTableName, aggregatesTableName, streamsTableName } = pool

  await client.send(
    new CreateTableCommand({
      TableName: eventsTableName,
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'NEW_IMAGE',
      },
      AttributeDefinitions: [{ AttributeName: AttributeKeys.Cursor, AttributeType: 'S' }],
      KeySchema: [
        {
          AttributeName: AttributeKeys.Cursor,
          KeyType: 'HASH',
        },
      ],
    })
  )

  await client.send(
    new CreateTableCommand({
      TableName: aggregatesTableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        {
          AttributeName: AttributeKeys.AggregateName,
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: AttributeKeys.AggregateVersion,
          KeyType: 'HASH',
        },
      ],
    })
  )

  await client.send(
    new CreateTableCommand({
      TableName: streamsTableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        {
          AttributeName: AttributeKeys.StreamName,
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: AttributeKeys.StreamName,
          KeyType: 'HASH',
        },
      ],
    })
  )
}

export default init
