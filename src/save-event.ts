import type { DynamoDBClient, TransactWriteItemsInput } from '@aws-sdk/client-dynamodb'
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

import { AttributeKeys } from './constants'
import ConcurrentError from './concurrent-error'
import createCursor from './create-cursor'

const saveEvent = async (
  pool: {
    client: DynamoDBClient
    eventsTableName: string
    aggregatesTableName: string
    streamsTableName: string
  },
  event: ResolveEvent
) => {
  const { client, eventsTableName, aggregatesTableName, streamsTableName } = pool

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

  const aggregateName = `${event.eventStoreId}/${event.tenantId}/${event.aggregateId}`
  TransactItems.push({
    Put: {
      TableName: aggregatesTableName,
      Item: {
        [AttributeKeys.AggregateName]: { S: aggregateName },
        [AttributeKeys.AggregateVersion]: { N: `${event.aggregateVersion}` },
        [AttributeKeys.Timestamp]: { N: `${event.timestamp}` },
      },
      ExpressionAttributeValues: {
        ':prevAggregateVersion': { N: `${event.aggregateVersion - 1}` },
      },
      ConditionExpression: `(${AttributeKeys.AggregateVersion} = :prevAggregateVersion OR attribute_not_exists(${AttributeKeys.AggregateName}))`,
      ReturnValuesOnConditionCheckFailure: 'NONE',
    },
  })

  const { streamIds = [] } = event

  for (const streamId of streamIds) {
    const streamName = `${event.eventStoreId}/${event.tenantId}/${streamId}}`
    TransactItems.push({
      Update: {
        TableName: streamsTableName,
        Key: {
          [AttributeKeys.StreamName]: { S: streamName },
        },
        ExpressionAttributeValues: {
          ':time': { N: `${event.timestamp}` },
          ':defaultStreamVersion': { N: `0` },
          ':incr': { N: `1` },
        },
        UpdateExpression: `SET ${AttributeKeys.StreamVersion} = if_not_exists(${AttributeKeys.StreamVersion}, :defaultStreamVersion) + :incr, ${AttributeKeys.Timestamp} = :time`,
        ReturnValuesOnConditionCheckFailure: 'NONE',
      },
    })
  }

  const command = new TransactWriteItemsCommand({
    TransactItems,
  })

  try {
    const info = await client.send(command)
    console.log(info)
  } catch (error) {
    console.log(error)
    if (/ConditionalCheckFailed/.test(`${error}`)) {
      throw new ConcurrentError(event)
    }
    throw error
  }
}

export default saveEvent
