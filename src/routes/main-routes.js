import KoaRouter from 'koa-router'
import controllers from '../controllers/index.js'

const router = new KoaRouter()
const pagesRouter = new KoaRouter({ prefix: '/pages' })

pagesRouter
  .get('/search', controllers.pages.search)
  .post('/', controllers.pages.create)
  .put('/:id', controllers.pages.update)
  .delete('/:id', controllers.pages.remove)

router
  .get('/hello', (ctx, next) => { ctx.body = 'Hello!' })
  .post('/es/search', controllers.es.search)
  .post('/git/commit', controllers.git.commit)
  .use(pagesRouter.routes())

export default router
