import KoaRouter from 'koa-router'
import controllers from '../controllers/index.js'

const router = new KoaRouter()
const pagesRouter = new KoaRouter({ prefix: '/pages' })
const sitesRouter = new KoaRouter({ prefix: '/sites' })

pagesRouter
  .get('/search', controllers.pages.search)
  .post('/', controllers.pages.create)
  .put('/:id', controllers.pages.update)
  .delete('/:id', controllers.pages.remove)

sitesRouter
  .get('/search', controllers.sites.search)
  .post('/', controllers.sites.create)
  .put('/:id', controllers.sites.update)
  .put('/visibility/:id', controllers.sites.updateVisibility)
  .delete('/:id', controllers.sites.remove)

router
  .get('/hello', (ctx, next) => { ctx.body = 'Hello!' })
  .post('/es/search', controllers.es.search)
  .post('/git/commit', controllers.git.commit)
  .use(pagesRouter.routes())
  .use(sitesRouter.routes())

export default router
