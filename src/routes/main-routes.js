import KoaRouter from 'koa-router'
import controllers from '../controllers/index'
import { urlPrefix } from '../config'

const mainRouter = new KoaRouter({ prefix: urlPrefix })
const pagesRouter = new KoaRouter({ prefix: '/pages' })
const sitesRouter = new KoaRouter({ prefix: '/sites' })
const usersRouter = new KoaRouter({ prefix: '/users' })

pagesRouter
  .get('/search', controllers.pages.search)
  .post('/', controllers.pages.create)
  .put('/:id', controllers.pages.update)
  .delete('/:id', controllers.pages.remove)

sitesRouter
  .get('/search', controllers.sites.search)
  .post('/', controllers.sites.create)
  .put('/:id', controllers.sites.update)
  .put('/:id/visibility', controllers.sites.updateVisibility)
  .delete('/:id', controllers.sites.remove)

usersRouter
  .get('/search', controllers.users.search)
  .post('/', controllers.users.create)
  .put('/:id', controllers.users.update)
  .delete('/:id', controllers.users.remove)

mainRouter
  .get('/hello', (ctx, next) => { ctx.body = 'Hello!' })
  .post('/es/search', controllers.es.search)
  .post('/git/commit', controllers.git.commit)
  .use(pagesRouter.routes())
  .use(sitesRouter.routes())
  .use(usersRouter.routes())

export default mainRouter
