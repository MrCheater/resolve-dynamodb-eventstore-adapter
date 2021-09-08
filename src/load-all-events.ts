import type { AttributeValue, DynamoDB } from '@aws-sdk/client-dynamodb'

import decodeEvent from './decode-event'

const loadAllEvents = async (pool: { client: DynamoDB; eventsTableName: string }) => {
  const { client, eventsTableName } = pool

  let PrevLastEvaluatedKey: { [key: string]: AttributeValue } | undefined = undefined
  do {
    const result: any = await client.scan({
      TableName: eventsTableName,
      ExclusiveStartKey: PrevLastEvaluatedKey,
    })
    const { Items, LastEvaluatedKey } = result
    console.log(...Items.map(decodeEvent))
    PrevLastEvaluatedKey = LastEvaluatedKey
  } while (PrevLastEvaluatedKey !== undefined)
}

export default loadAllEvents
