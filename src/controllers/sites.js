import esClient from '../services/elasticsearch'
import { getDatetime, paginate } from '../lib/util'
import { System as SystemConfig } from '../config'

import {
  removeSite as removeAllPages,
  updateVisibility as updatePagesVisibility
} from './pages'

const index = `${SystemConfig.KeepWork_ENV}_kw_websites`
const type = 'websites'

export const search = async ctx => {
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
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Bad search request')
  })
}

export const create = async ctx => {
  let site = validateCreate(ctx)
  let id = ctx.checkBody('url').encodeURIComponent().value
  await esClient.create({
    index: index,
    type: type,
    id: id,
    body: site
  }).then(data => {
    ctx.status = 201
    ctx.body = { created: true }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Already exists')
  })
}

export const update = async ctx => {
  let site = validateUpdate(ctx)
  let id = ctx.params.id
  await esClient.update({
    index: index,
    type: type,
    id: id,
    body: { doc: site }
  }).then(data => {
    ctx.body = { updated: true }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Data not found')
  })
}

export const remove = async ctx => {
  ctx.checkParams('id').notEmpty('required')
  if (ctx.errors) ctx.throw(400)
  let id = ctx.params.id
  await removeAllPages(ctx)
  await esClient.delete({
    index: index,
    type: type,
    id: id
  }).then(data => {
    ctx.body.deleted = true
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(err.statusCode, 'Data not found')
  })
}

export const updateVisibility = async ctx => {
  await updatePagesVisibility(ctx)
  ctx.body.updated = true
}

export const removeUser = async ctx => {
  validateRemoveUser(ctx)
  await esClient.deleteByQuery({
    index: index,
    type: type,
    body: getRemoveUserDSL(ctx)
  }).then(data => {
    ctx.body = {
      total_pages: data.total,
      deleted_pages: data.deleted
    }
  }).catch(err => {
    ctx.logger.error(err)
    ctx.throw(500, 'Fail to delete pages of this user')
  })
}

export const validateCreate = ctx => {
  ctx.checkBody('username').notEmpty('required').len(4, 30, 'invalid length')
  ctx.checkBody('sitename').notEmpty('required')
  ctx.checkBody('logoUrl').notEmpty('required').isUrl('must be an url')
  ctx.checkBody('desc').optional()
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  ctx.checkBody('displayName').default(reqBody.sitename)
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

export const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required')
  ctx.checkBody('displayName').optional()
  ctx.checkBody('desc').optional()
  ctx.checkBody('logoUrl').optional().isUrl('must be an url')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  return {
    logoUrl: reqBody.logoUrl,
    display_name: reqBody.displayName,
    desc: reqBody.desc,
    update_time: getDatetime()
  }
}

export const validateSearch = ctx => {
  ctx.checkQuery('q').notEmpty('required')
  ctx.checkQuery('page').default(1).isInt('must be an int')
  ctx.checkQuery('size').default(20).isInt('must be an int')
  ctx.checkQuery('username').optional()
  if (ctx.errors) ctx.throw(400)
}

export const getSearchDSL = ctx => {
  return {
    query: {
      multi_match: {
        query: ctx.query.q,
        fields: ['sitename', 'display_name'],
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
    post_filter: ctx.query.username ? {
      term: { username: ctx.query.username }
    } : undefined
  }
}

export const validateRemoveUser = ctx => {
  let username = ctx.checkParams('id').notEmpty('required').value
  if (ctx.errors) ctx.throw(400)
  try {
    ctx.request.body = { username }
  } catch (err) {
    ctx.throw(500)
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

export const getRemoveUserDSL = ctx => {
  return {
    query: {
      bool: {
        must: [
          { term: { username: ctx.request.body.username } }
        ]
      }
    }
  }
}
