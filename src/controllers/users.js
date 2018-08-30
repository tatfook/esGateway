import esClient from '../services/elasticsearch'
import { getDatetime, paginate } from '../lib/util'
import { System as SystemConfig } from '../config'
import { removeUser as removeAllPages } from './pages'
import { removeUser as removeAllsites } from './sites'
import { ensureAdmin } from '../extend/context'

const index = SystemConfig.Es_Indexes.users
const type = 'users'

export const search = async ctx => {
  validateSearch(ctx)
  const [from, size] = paginate(ctx.query)
  await esClient.search({
    index: index,
    type: type,
    from: from,
    size: size,
    body: getSearchDSL(ctx)
  }).then(data => {
    ctx.body = wrapSearchResult(data)
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Bad search request')
  })
}

export const create = async ctx => {
  ensureAdmin(ctx)
  let user = validateCreate(ctx)
  let id = ctx.checkBody('username').value
  await esClient.create({
    index: index,
    type: type,
    id: id,
    body: user
  }).then(data => {
    ctx.status = 201
    ctx.body = { created: true }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Already exists')
  })
}

export const update = async ctx => {
  ensureAdmin(ctx)
  let user = validateUpdate(ctx)
  let id = ctx.params.id
  await esClient.update({
    index: index,
    type: type,
    id: id,
    body: { doc: user }
  }).then(data => {
    ctx.body = { updated: true }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Data not found')
  })
}

export const remove = async ctx => {
  ensureAdmin(ctx)
  ctx.checkParams('id').notEmpty('required')
  if (ctx.errors) ctx.throw(400)
  let id = ctx.params.id
  await removeAllPages(ctx)
  await removeAllsites(ctx)
  await esClient.delete({
    index: index,
    type: type,
    id: id
  }).then(data => {
    ctx.body = { deleted: true }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Data not found')
  })
}

export const validateCreate = ctx => {
  ctx.checkBody('username').notEmpty('required').len(4, 30, 'invalid length')
    .notContains(' ', 'can not contains invalid chars')
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

export const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required')
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

export const validateSearch = ctx => {
  ctx.checkQuery('q').notEmpty('required')
  ctx.checkQuery('page').default(1).isInt('must be an int')
  ctx.checkQuery('size').default(20).isInt('must be an int')
  if (ctx.errors) ctx.throw(400)
}

export const getSearchDSL = ctx => {
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

export const wrapSearchResult = data => {
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
