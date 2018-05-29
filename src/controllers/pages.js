import esClient from '../services/elasticsearch'
import { getDatetime, paginate } from '../lib/util'
import { System as SystemConfig } from '../config'

const index = `${SystemConfig.KeepWork_ENV}_kw_pages`
const type = 'pages'

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
  let page = validateCreate(ctx)
  let id = ctx.checkBody('url').encodeBase64().value
  await esClient.create({
    index: index,
    type: type,
    id: id,
    body: page
  }).then(data => {
    ctx.status = 201
    ctx.body = { created: true }
  }).catch(e => {
    console.error(e)
    ctx.throw(e.statusCode, 'Already exists')
  })
}

export const update = async (ctx, next) => {
  let page = validateUpdate(ctx)
  let id = ctx.params.id
  await esClient.update({
    index: index,
    type: type,
    id: id,
    body: { doc: page }
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

export const removeSite = async (ctx, next) => {
  validateRemoveSite(ctx)
  await esClient.deleteByQuery({
    index: index,
    type: type,
    body: getRemoveSiteDSL(ctx)
  }).then(data => {
    ctx.body = {
      total_pages: data.total,
      deleted_pages: data.deleted
    }
  }).catch(e => {
    console.error(e)
    ctx.throw(500, 'Fail to delete pages of this website')
  })
}

export const updateVisibility = async ctx => {
  validateUpdateVisibility(ctx)
  await esClient.updateByQuery({
    index: index,
    type: type,
    body: getUpdateVisibilityDSL(ctx)
  }).then(data => {
    ctx.body = {
      total_pages: data.total,
      updated_pages: data.updated
    }
  }).catch(e => {
    console.error(e)
    ctx.throw(500, 'Fail to update pages of this website')
  })
}

export const validateCreate = ctx => {
  ctx.checkBody('url').notEmpty('required').match(/^\/.+\/.+\/.+/, 'invalid format')
  ctx.checkBody('source_url').notEmpty('required').isUrl('must be an url')
  ctx.checkBody('visibility').default('public').in(['public', 'private'], 'invalid')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  let username, sitename, pagename
  try {
    [username, sitename, pagename] = reqBody.url.split('/').slice(1)
  } catch (e) {
    ctx.throw(500)
  }

  return {
    url: reqBody.url,
    username: username,
    sitename: sitename,
    pagename: pagename,
    source_url: reqBody.source_url,
    visibility: reqBody.visibility,
    update_time: getDatetime()
  }
}

export const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required').isBase64('invalid')
  ctx.checkBody('visibility').optional().in(['public', 'private'], 'invalid')
  ctx.checkBody('content').optional()
  ctx.checkBody('tags').optional().len(0, 5, 'Too many members')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  return {
    content: reqBody.content,
    tags: reqBody.tags,
    visibility: reqBody.visibility,
    update_time: getDatetime()
  }
}

export const validateSearch = ctx => {
  ctx.checkQuery('q').notEmpty('required')
  ctx.checkQuery('page').optional().default(1).isInt('must be an int')
  ctx.checkQuery('size').optional().default(20).isInt('must be an int')
  ctx.checkQuery('username').optional()
  if (ctx.errors) ctx.throw(400)
}

export const validateRemoveSite = ctx => {
  let siteUrl = ctx.checkParams('id').notEmpty('required').isBase64('invalid')
    .decodeBase64().match(/^\/.+\/.+/, 'invalid').value
  if (ctx.errors) ctx.throw(400)
  try {
    let splitedUrl = siteUrl.split('/')
    ctx.request.body = { username: splitedUrl[1], sitename: splitedUrl[2] }
  } catch (e) {
    ctx.throw(500)
  }
}

export const validateUpdateVisibility = ctx => {
  let siteUrl = ctx.checkParams('id').notEmpty('required').isBase64('invalid')
    .decodeBase64().match(/^\/.+\/.+/, 'invalid').value
  ctx.checkBody('visibility').notEmpty('required').isIn(['public', 'private'], 'invalid')
  if (ctx.errors) ctx.throw(400)
  try {
    let splitedUrl = siteUrl.split('/')
    ctx.request.body.username = splitedUrl[1]
    ctx.request.body.sitename = splitedUrl[2]
  } catch (e) {
    ctx.throw(500)
  }
}

// DSL(Domain Specific Language) is a json syntax used to
// search data in elasticsearch
export const getSearchDSL = ctx => {
  return {
    query: {
      bool: {
        should: [
          {
            multi_match: {
              query: ctx.query.q,
              fields: [
                'content',
                'tags',
                'username',
                'sitename',
                'pagename'
              ],
              fuzziness: 'AUTO'
            }
          }
        ],
        must_not: { match: { visibility: 'private' } }
      }
    },
    highlight: {
      fields: {
        content: {},
        tags: {},
        username: {},
        sitename: {},
        pagename: {}
      },
      pre_tags: '<span>',
      post_tags: '</span>'
    },
    post_filter: ctx.query.username ? {
      term: { username: ctx.query.username }
    } : undefined
  }
}

export const getRemoveSiteDSL = ctx => {
  return {
    query: {
      bool: {
        must: [
          { term: { username: ctx.request.body.username } },
          { term: { sitename: ctx.request.body.sitename } }
        ]
      }
    }
  }
}

export const getUpdateVisibilityDSL = ctx => {
  return {
    query: {
      bool: {
        must: [
          { term: { username: ctx.request.body.username } },
          { term: { sitename: ctx.request.body.sitename } }
        ]
      }
    },
    script: {
      source: `ctx._source.visibility = "${ctx.request.body.visibility}"`, // script runs in es
      lang: 'painless'
    }
  }
}

export const wrapSearchResult = data => {
  let hits = []
  data.hits.hits.forEach(hit => {
    hit._source.highlight = hit.highlight
    hit._source.content = undefined
    hit._source.update_time = undefined
    hit._source.visibility = undefined
    hits.push(hit._source)
  })
  return {
    took: data.took,
    total: data.hits.total,
    timed_out: data.timed_out,
    hits: hits
  }
}
