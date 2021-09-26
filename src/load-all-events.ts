import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const loadAllEvents = async (
  pool: { client: DynamoDBClient; eventsTableName: string; streamsTableName: string },
  cursor?: string
) => {
  const { client, eventsTableName, streamsTableName } = pool

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
        Limit: 2,
      })
    )

    console.log('LastEvaluatedKey', LastEvaluatedKey)
    console.log('Items', Items)

    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)

  do {
    const { Items = [], LastEvaluatedKey }: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: streamsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
        Limit: 2,
      })
    )

    console.log('LastEvaluatedKey', LastEvaluatedKey)
    console.log('Items', Items)

    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
