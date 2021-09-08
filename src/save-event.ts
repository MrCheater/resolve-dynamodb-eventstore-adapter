import type { DynamoDB } from '@aws-sdk/client-dynamodb'

import type { ResolveEvent } from './types'

import encodeEvent from './encode-event'

const saveEvent = async (
  pool: { client: DynamoDB; eventsTableName: string },
  event: ResolveEvent
) => {
  const { client, eventsTableName } = pool

  await client.putItem({
    TableName: eventsTableName,
    Item: encodeEvent(event),
  })
}

export default saveEvent
