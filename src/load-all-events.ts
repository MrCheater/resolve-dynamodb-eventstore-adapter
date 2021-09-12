import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

const loadAllEvents = async (
  pool: { client: DynamoDBClient; eventsTableName: string; cursorsTableName: string },
  eventStoreId: string,
  cursor?: string
) => {
  const { client, eventsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined

  if (cursor != null) {
    PrevLastEvaluatedKey = {
      primaryKey: {
        S: cursor,
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

    console.log(...Items)
    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
