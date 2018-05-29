import esClient from '../../src/services/elasticsearch'

test('connect to es', async () => {
  expect.assertions(1)
  const result = await esClient.ping({ method: 'GET' })
  expect(result).toBeTruthy()
})
