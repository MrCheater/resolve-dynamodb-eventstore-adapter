import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

// import encodeEvent from './encode-event'
import ConcurrentError from './concurrent-error'
import getPrimaryKey from './get-primary-key'

const saveEvent = async (
  pool: { client: DynamoDBClient; eventsTableName: string},
  event: ResolveEvent
) => {
  const { client, eventsTableName} = pool

  // const items = encodeEvent(event)

  const command = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: eventsTableName,
          Item: {
            primaryKey: {
              S: getPrimaryKey(event)
            },
            event: {
              S: JSON.stringify(event)
            }
          }
//          Item: encodeEvent(event),
        },
      },
    ],
  })

  try {
    const info = await client.send(command)
    console.log(info)
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // throw new ConcurrentError('aggregate', event.aggregateId)
    }
    throw error
  }
}

export default saveEvent
