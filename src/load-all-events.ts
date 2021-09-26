import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/client-dynamodb'

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
    const { Items = [], LastEvaluatedKey }: QueryCommandOutput = await client.send(
      new QueryCommand({
        TableName: eventsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
        ScanIndexForward: true,
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
