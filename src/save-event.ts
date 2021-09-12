import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItemsCommand, TransactWriteItemsInput } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'
import { isResolveCQRSEvent } from './types'

import { AttributeKeys } from './constants'
import ConcurrentError from './concurrent-error'
import createCursor from './create-cursor'

const saveEvent = async (
  pool: {
    client: DynamoDBClient
    eventsTableName: string
    cursorsTableName: string
    streamsTableName: string
  },
  event: ResolveEvent
) => {
  const { client, eventsTableName, streamsTableName } = pool

  const cursor = createCursor(event)
  const encodedEvent = JSON.stringify(event)

  const TransactItems: TransactWriteItemsInput['TransactItems'] = [
    {
      Put: {
        TableName: eventsTableName,
        Item: {
          [AttributeKeys.Cursor]: {
            S: cursor,
          },
          [AttributeKeys.Event]: {
            S: encodedEvent,
          },
        },
      },
    },
  ]

  if (isResolveCQRSEvent(event)) {
    const streamName = `${event.eventStoreId}/${event.aggregateId}`
    TransactItems.push({
      Put: {
        TableName: streamsTableName,
        Item: {
          [AttributeKeys.StreamName]: {
            S: streamName,
          },
          [AttributeKeys.StreamVersion]: {
            N: `${event.aggregateVersion}`,
          },
          [AttributeKeys.Event]: {
            S: encodedEvent,
          },
        },
        ConditionExpression: `attribute_not_exists(${AttributeKeys.StreamName}) AND attribute_not_exists(${AttributeKeys.StreamVersion})`,
      },
    })
  }

  const { streamIds } = event
  if (streamIds != null) {
    for (const [streamId, streamVersion] of Object.entries(streamIds)) {
      const streamName = `${event.eventStoreId}/${streamId}}`
      TransactItems.push({
        Put: {
          TableName: streamsTableName,
          Item: {
            [AttributeKeys.StreamName]: {
              S: streamName,
            },
            [AttributeKeys.StreamVersion]: {
              N: `${streamVersion}`,
            },
            [AttributeKeys.Event]: {
              S: encodedEvent,
            },
          },
          ConditionExpression: `attribute_not_exists(${AttributeKeys.StreamName}) AND attribute_not_exists(${AttributeKeys.StreamVersion})`,
        },
      })
    }
  }

  const command = new TransactWriteItemsCommand({
    TransactItems,
  })

  try {
    const info = await client.send(command)
    console.log(info)
  } catch (error) {
    if (/ConditionalCheckFailed/.test(`${error}`)) {
      throw new ConcurrentError(event)
    }
    throw error
  }
}

export default saveEvent
