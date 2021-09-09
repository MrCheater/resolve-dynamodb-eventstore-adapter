import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

import encodeEvent from './encode-event'
import ConcurrentError from './concurrent-error'

const saveEvent = async (
  pool: { client: DynamoDBClient; eventsTableName: string },
  event: ResolveEvent
) => {
  const { client, eventsTableName } = pool

  const command = new PutItemCommand({
    TableName: eventsTableName,
    Item: encodeEvent(event),
    ConditionExpression:
      'attribute_not_exists(aggregateId) AND attribute_not_exists(aggregateVersion)',
  })

  try {
    await client.send(command)
  } catch (error) {
    console.log('code', error.code)
    if (error.name === 'ConditionalCheckFailedException') {
      throw new ConcurrentError()
    }
    throw error
  }
}

export default saveEvent
