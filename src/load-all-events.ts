import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import getEventStoreStartCursor from './get-event-store-start-cursor'
import { AttributeKeys } from './constants'

const loadAllEvents = async (
  pool: { client: DynamoDBClient; eventsTableName: string; cursorsTableName: string },
  eventStoreId: string,
  cursor?: string
) => {
  const { client, eventsTableName, cursorsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined

  if (cursor != null) {
    PrevLastEvaluatedKey = {
      [AttributeKeys.Cursor]: {
        S: cursor,
      },
    }
  } else {
    PrevLastEvaluatedKey = {
      [AttributeKeys.Cursor]: {
        S: await getEventStoreStartCursor(
          {
            client,
            cursorsTableName,
          },
          eventStoreId
        ),
      },
    }
  }

  do {
    const command = new ScanCommand({
      TableName: eventsTableName,
      ExclusiveStartKey: PrevLastEvaluatedKey,
    })
    const result: ScanCommandOutput = await client.send(command)
    const { Items = [], LastEvaluatedKey } = result

    for (const Item of Items) {
      const event = JSON.parse((Item as any)[AttributeKeys.Event].S)
      if (event.eventStoreId !== eventStoreId) {
        return
      }
    }

    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
