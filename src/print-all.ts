import type { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const printAll = async (
  pool: { client: DynamoDBClient; eventsTableName: string;   aggregatesTableName: string; streamsTableName: string }
) => {
  const { client, eventsTableName,aggregatesTableName, streamsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined

  console.log(`==== ${eventsTableName} ====`)
  do {
    const { Items = [], LastEvaluatedKey }: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: eventsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
      })
    )

    for(const Item of Items) {
      console.log(Item)
    }

    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)

  console.log(`==== ${aggregatesTableName} ====`)
  do {
    const { Items = [], LastEvaluatedKey }: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: aggregatesTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
      })
    )

    for(const Item of Items) {
      console.log(Item)
    }


    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)

  console.log(`==== ${streamsTableName} ====`)
  do {
    const { Items = [], LastEvaluatedKey }: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: streamsTableName,
        ExclusiveStartKey: PrevLastEvaluatedKey,
      })
    )

    for(const Item of Items) {
      console.log(Item)
    }


    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default printAll
