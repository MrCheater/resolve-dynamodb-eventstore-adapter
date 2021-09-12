import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

import { AttributeKeys, SystemEventTypes } from './constants'
import createCursor from './create-cursor'
import getRandomRequestId from './get-random-request-id'
import { ResolveEvent } from './types'

const createEventStore = async (
  pool: {
    client: DynamoDBClient
    eventsTableName: string
    cursorsTableName: string
  },
  eventStoreId: string
) => {
  const { client, eventsTableName, cursorsTableName } = pool

  const requestId = getRandomRequestId()
  const eventStoreCreatedAt = Date.now()

  const cursor = createCursor({
    timestamp: eventStoreCreatedAt,
    eventStoreId,
    requestId,
  })

  const event: ResolveEvent = {
    type: SystemEventTypes.EventStoreCreated,
    timestamp: eventStoreCreatedAt,
    eventStoreId,
    requestId,
    payload: {},
    streamIds: {},
  }

  await client.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: eventsTableName,
            Item: {
              [AttributeKeys.Cursor]: {
                S: cursor,
              },
              [AttributeKeys.Event]: {
                S: JSON.stringify(event),
              },
            },
          },
        },
        {
          Put: {
            TableName: cursorsTableName,
            Item: {
              [AttributeKeys.CursorName]: {
                S: eventStoreId,
              },
              [AttributeKeys.Cursor]: {
                S: cursor,
              },
            },
            ConditionExpression: `attribute_not_exists(${AttributeKeys.CursorName})`,
          },
        },
      ],
    })
  )
}

export default createEventStore
