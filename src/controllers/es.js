import esClient from '../services/elasticsearch'

export const search = async ctx => {
  const data = await esClient.search(ctx.request.body).catch(e => {})
  ctx.body = data
}
