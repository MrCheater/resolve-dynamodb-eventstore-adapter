import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const init = async (pool: {
  client: DynamoDBClient
  eventsTableName: string
  cursorsTableName: string
  streamsTableName: string
}) => {
  const { client, eventsTableName, cursorsTableName, streamsTableName } = pool

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
      TableName: cursorsTableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [{ AttributeName: AttributeKeys.CursorName, AttributeType: 'S' }],
      KeySchema: [
        {
          AttributeName: AttributeKeys.CursorName,
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
        {
          AttributeName: AttributeKeys.StreamVersion,
          AttributeType: 'N',
        },
      ],
      KeySchema: [
        {
          AttributeName: AttributeKeys.StreamName,
          KeyType: 'HASH',
        },
        {
          AttributeName: AttributeKeys.StreamVersion,
          KeyType: 'RANGE',
        },
      ],
    })
  )
}

export default init
