import elasticsearch from 'elasticsearch'
import { System as SystemConfig } from '../config'

const esClient = new elasticsearch.Client({ host: SystemConfig.Es_Base_URL })

export const search = async ctx => {
  const data = await esClient.search(ctx.request.body).catch(e => {})
  ctx.body = data
}
