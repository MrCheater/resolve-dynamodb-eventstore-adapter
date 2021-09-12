import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'

import { AttributeKeys } from './constants'

const getEventStoreStartCursor = async (
  pool: { client: DynamoDBClient; cursorsTableName: string },
  eventStoreId: string
): Promise<string> => {
  const { client, cursorsTableName } = pool

  const { Item } = await client.send(
    new GetItemCommand({
      TableName: cursorsTableName,
      Key: {
        [AttributeKeys.CursorName]: {
          S: eventStoreId,
        },
      },
    })
  )

  const cursor = Item?.[AttributeKeys.Cursor]?.S

  if (cursor == null) {
    throw new Error(`Event store "${eventStoreId}" does not exists`)
  }

  return cursor
}

export default getEventStoreStartCursor
