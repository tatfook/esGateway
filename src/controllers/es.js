import getEsClient from '../services/elasticsearch'

const esClient = getEsClient()

export const search = async ctx => {
  const data = await esClient.search(ctx.request.body).catch(e => {})
  ctx.body = data
}
