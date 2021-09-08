import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

test('wip', async () => {
  const client = new DynamoDBClient({
    region: 'test',
    endpoint: { hostname: 'localhost', port: 8000, path: '/', protocol: 'http' },
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    },
  })
  const command = new ListTablesCommand({})
  try {
    const results = await client.send(command)
    console.log(results?.TableNames?.join('\n'))
  } catch (err) {
    console.error(err)
  }
})
