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
          [AttributeKeys.StreamName]: { S: streamName },
          [AttributeKeys.StreamVersion]: { N: `${event.aggregateVersion}` },
          [AttributeKeys.Timestamp]: { N: `${event.timestamp}` },
        },
        ExpressionAttributeValues: {
          ':prevAggregateVersion': { N: `${event.aggregateVersion - 1}` },
        },
        ConditionExpression: `${AttributeKeys.StreamVersion} = :prevAggregateVersion OR attribute_not_exists(${AttributeKeys.StreamName})`,
        ReturnValuesOnConditionCheckFailure: 'NONE',
      },
    })
  }

  const { streamIds } = event
  if (streamIds != null) {
    for (const streamId of streamIds) {
      const streamName = `${event.eventStoreId}/${streamId}}`
      TransactItems.push({
        Update: {
          TableName: streamsTableName,
          Key: {
            [AttributeKeys.StreamName]: { S: streamName },
          },
          ExpressionAttributeValues: {
            ':streamName': { S: streamName },
            ':time': { N: `${event.timestamp}` },
            ':defaultStreamVersion': { N: `0` },
            ':inc': { N: `1` },
          },
          UpdateExpression: `SET ${AttributeKeys.StreamVersion} = if_not_exists(${AttributeKeys.StreamVersion}, :defaultStreamVersion) + :inc, ${AttributeKeys.Timestamp} = :time, ${AttributeKeys.StreamName} = :streamName`,

          // ReturnValuesOnConditionCheckFailure: 'NONE',
        },
      })
    }
    /*
    table.update_item(
    Key={
        'key': my_key
    },
    UpdateExpression="SET my_value = if_not_exists(my_value, :start) + :inc",

    ExpressionAttributeValues={
        ':inc': my_increment,
        ':start': 0,
    },
    ReturnValues="UPDATED_NEW"
)
     */
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
