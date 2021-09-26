import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const loadAllEvents = async (
  pool: { client: DynamoDBClient; eventsTableName: string},
  eventStoreId: string,
  cursor?: string
) => {
  const { client, eventsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined

  if (cursor != null) {
    PrevLastEvaluatedKey = {
      [AttributeKeys.Cursor]: {
        S: cursor,
      },
    }
  }

  do {
    const { Items = [], LastEvaluatedKey }: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: eventsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
        Limit: 2
      })
    )

    console.log('LastEvaluatedKey', LastEvaluatedKey)
    console.log('Items', Items)

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
