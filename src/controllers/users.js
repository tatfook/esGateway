import esClient from '../services/elasticsearch'
import { getDatetime, paginate } from '../lib/util'
import { System as SystemConfig } from '../config'

let index = `${SystemConfig.KeepWork_ENV}_kw_users`
let type = 'users'

export const search = async (ctx, next) => {
  validateSearch(ctx)
  let [from, size] = paginate(
    ctx.query.page,
    ctx.query.size
  )
  await esClient.search({
    index: index,
    type: type,
    from: from,
    size: size,
    body: getSearchDSL(ctx)
  }).then(data => {
    ctx.body = wrapSearchResult(data)
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Bad search request')
  })
}

export const create = async (ctx, next) => {
  let user = validateCreate(ctx)
  let id = ctx.checkBody('username').encodeBase64().value
  await esClient.create({
    index: index,
    type: type,
    id: id,
    body: user
  }).then(data => {
    ctx.status = 201
    ctx.body = { created: true }
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Already exists')
  })
}

export const update = async (ctx, next) => {
  let user = validateUpdate(ctx)
  let id = ctx.params.id
  await esClient.update({
    index: index,
    type: type,
    id: id,
    body: { doc: user }
  }).then(data => {
    ctx.body = { updated: true }
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Data not found')
  })
}

export const remove = async (ctx, next) => {
  ctx.checkParams('id').notEmpty('required').isBase64('invalid')
  if (ctx.errors) ctx.throw(400)
  let id = ctx.params.id
  await esClient.delete({
    index: index,
    type: type,
    id: id
  }).then(data => {
    ctx.body = { deleted: true }
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Data not found')
  })
}

const validateCreate = ctx => {
  ctx.checkBody('username').notEmpty('required').len(4, 30, 'invalid length')
  ctx.checkBody('portrait').notEmpty('required').isUrl('must be an url')
  ctx.checkBody('location').optional()
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  ctx.checkBody('displayName').optional().default(reqBody.username)
  return {
    username: reqBody.username,
    suggestion: reqBody.username,
    display_name: reqBody.displayName,
    portrait: reqBody.portrait,
    location: reqBody.location,
    update_time: getDatetime()
  }
}

const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required').isBase64('invalid')
  ctx.checkBody('portrait').optional().isUrl('must be an url')
  ctx.checkBody('displayName').optional()
  ctx.checkBody('location').optional()
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  return {
    display_name: reqBody.displayName,
    portrait: reqBody.portrait,
    location: reqBody.location,
    update_time: getDatetime()
  }
}

const validateSearch = ctx => {
  ctx.checkQuery('q').notEmpty('required')
  ctx.checkQuery('page').optional().default(1).isNumeric()
  ctx.checkQuery('size').optional().default(10).isNumeric()
  ctx.checkQuery('username').optional()
  if (ctx.errors) ctx.throw(400)
}

const getSearchDSL = ctx => {
  return {
    query: {
      multi_match: {
        query: ctx.query.q,
        fields: ['username', 'display_name'],
        fuzziness: 'AUTO'
      }
    },
    highlight: {
      fields: {
        username: {},
        display_name: {}
      },
      pre_tags: '<span>',
      post_tags: '</span>'
    }
  }
}

const wrapSearchResult = data => {
  let hits = []
  data.hits.hits.forEach(hit => {
    hit._source.highlight = hit.highlight
    hit._source.update_time = undefined
    hits.push(hit._source)
  })
  return {
    took: data.took,
    total: data.hits.total,
    timed_out: data.timed_out,
    hits: hits
  }
}
