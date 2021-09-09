import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

import encodeEvent from './encode-event'

const saveEvent = async (
  pool: { client: DynamoDBClient; eventsTableName: string },
  event: ResolveEvent
) => {
  const { client, eventsTableName } = pool

  const command = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: eventsTableName,
          Item: encodeEvent(event),
        },
      },
    ],
  })

  await client.send(command)
}

export default saveEvent
