import getEsClient from '../services/elasticsearch'
// import { System as SystemConfig } from '../config'

// let index = SystemConfig.KeepWork_ENV + '_kw_pages'
// let type = 'pages'
const esClient = getEsClient()

export const search = async (ctx, next) => {
  ctx.body = await esClient.ping()
}

export const create = async (ctx, next) => {
  ctx.body = 'create'
}

export const update = async (ctx, next) => {
  ctx.body = 'update'
}

export const remove = async (ctx, next) => {
  ctx.body = 'remove'
}
