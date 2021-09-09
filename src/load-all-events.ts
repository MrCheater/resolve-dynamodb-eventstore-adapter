import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import decodeEvent from './decode-event'

const loadAllEvents = async (pool: { client: DynamoDBClient; eventsTableName: string }) => {
  const { client, eventsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined
  do {
    const command = new ScanCommand({
      TableName: eventsTableName,
      ExclusiveStartKey: PrevLastEvaluatedKey,
    })
    const result: ScanCommandOutput = await client.send(command)
    const { Items = [], LastEvaluatedKey } = result

    console.log(...Items.map(decodeEvent))
    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
