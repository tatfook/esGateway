import esClient from '../services/elasticsearch'
import { getDatetime, paginate } from '../lib/util'
import { System as SystemConfig } from '../config'

import {
  removeSite as removeAllPages,
  updateVisibility as updatePagesVisibility
} from './pages'

let index = `${SystemConfig.KeepWork_ENV}_kw_websites`
let type = 'websites'

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
  let site = validateCreate(ctx)
  let id = ctx.checkBody('url').encodeBase64().value
  await esClient.create({
    index: index,
    type: type,
    id: id,
    body: site
  }).then(data => {
    ctx.status = 201
    ctx.body = { created: true }
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Already exists')
  })
}

export const update = async (ctx, next) => {
  let site = validateUpdate(ctx)
  let id = ctx.params.id
  await esClient.update({
    index: index,
    type: type,
    id: id,
    body: { doc: site }
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
  await removeAllPages(ctx, next)
  await esClient.delete({
    index: index,
    type: type,
    id: id
  }).then(data => {
    ctx.body.deleted = true
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Data not found')
  })
}

export const updateVisibility = async (ctx, next) => {
  await updatePagesVisibility(ctx, next)
  ctx.body.updated = true
}

const validateCreate = ctx => {
  ctx.checkBody('username').notEmpty('required')
  ctx.checkBody('sitename').notEmpty('required')
  ctx.checkBody('logoUrl').notEmpty('required').isUrl('must be an url')
  ctx.checkBody('displayName').empty()
  ctx.checkBody('desc').empty()
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  reqBody.url = `/${reqBody.username}/${reqBody.sitename}`
  return {
    username: reqBody.username,
    sitename: reqBody.sitename,
    logoUrl: reqBody.logoUrl,
    display_name: reqBody.displayName,
    desc: reqBody.desc,
    url: reqBody.url,
    update_time: getDatetime()
  }
}

const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required').isBase64('invalid')
  ctx.checkBody('displayName').empty()
  ctx.checkBody('desc').empty()
  ctx.checkBody('logoUrl').empty().isUrl('must be an url')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  return {
    logoUrl: reqBody.logoUrl,
    display_name: reqBody.displayName,
    desc: reqBody.desc,
    update_time: getDatetime()
  }
}

const validateSearch = ctx => {
  ctx.checkQuery('q').notEmpty('required')
  ctx.checkQuery('page').empty().default(1).isNumeric()
  ctx.checkQuery('size').empty().default(10).isNumeric()
  ctx.checkQuery('username').empty()
  if (ctx.errors) ctx.throw(400)
}

const getSearchDSL = ctx => {
  return {
    query: {
      multi_match: {
        query: ctx.query.q,
        fields: [ 'sitename', 'display_name' ],
        fuzziness: 'AUTO'
      }
    },
    highlight: {
      fields: {
        sitename: {},
        display_name: {}
      },
      pre_tags: '<span>',
      post_tags: '</span>'
    },
    post_filter: ctx.query.username ? { term: { username: ctx.query.username } } : undefined
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
