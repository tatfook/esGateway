import getEsClient from '../services/elasticsearch'
import moment from 'moment'
import { System as SystemConfig } from '../config'

let index = `${SystemConfig.KeepWork_ENV}_kw_pages`
let type = 'pages'
const esClient = getEsClient()

export const search = async (ctx, next) => {
  ctx.body = await esClient.ping()
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
    ctx.body = {created: true}
  }).catch(e => {
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
    ctx.body = {updated: true}
  }).catch(e => {
    ctx.throw(e.statusCode, 'data not found')
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
    ctx.body = {deleted: true}
  }).catch(e => {
    ctx.throw(e.statusCode, 'data not found')
  })
}

const validateCreate = ctx => {
  ctx.checkBody('url').notEmpty('required').match(/^\/.+\/.+\/.+/u, 'invalid format')
  ctx.checkBody('source_url').notEmpty('required').isUrl('must be an url')
  ctx.checkBody('visibility').notEmpty('required').in(['public', 'private'], 'invalid')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body
  let [username, sitename, pagename] = reqBody.url.split('/').slice(1)

  return {
    url: reqBody.url,
    username: username,
    sitename: sitename,
    pagename: pagename,
    source_url: reqBody.source_url,
    visibility: reqBody.visibility,
    update_time: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}

const validateUpdate = ctx => {
  ctx.checkParams('id').notEmpty('required').isBase64('invalid')
  ctx.checkBody('visibility').empty().in(['public', 'private'], 'invalid')
  ctx.checkBody('content').empty()
  ctx.checkBody('tags').empty().len(0, 5, 'Too many members')
  if (ctx.errors) ctx.throw(400)

  let reqBody = ctx.request.body

  return {
    content: reqBody.content,
    tags: reqBody.tags,
    visibility: reqBody.visibility,
    update_time: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}
