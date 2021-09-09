import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

import encodeEvent from './encode-event'
import ConcurrentError from './concurrent-error'

const saveEvent = async (
  pool: { client: DynamoDBClient; eventsTableName: string, eventStoreId: string },
  event: ResolveEvent
) => {
  const { client, eventsTableName } = pool



  const command = new PutItemCommand({
    TableName: eventsTableName,
    Item: encodeEvent(event),
    ConditionExpression:
      'attribute_not_exists(streamId) AND attribute_not_exists(streamVersion)',
  })

  try {
    await client.send(command)
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new ConcurrentError('aggregate', event.aggregateId)
    }
    throw error
  }
}

export default saveEvent
