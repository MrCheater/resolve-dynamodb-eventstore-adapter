import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import decodeEvent from './decode-event'
import getPrimaryKey from './get-primary-key'

const loadAllEvents = async (
  pool: { client: DynamoDBClient; eventsTableName: string },
  eventStoreId: string,
  startTime?: number
) => {
  const { client, eventsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined

  if (startTime != null) {
    PrevLastEvaluatedKey = {
      primaryKey: {
        S: getPrimaryKey({
          requestId: '00000',
          eventStoreId,
          type: 'type',
          payload: {},
          timestamp: startTime,
          aggregateVersion: 0,
          aggregateId: 'aggregateId',
        }),
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
    //console.log(...Items.map(decodeEvent))
    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
