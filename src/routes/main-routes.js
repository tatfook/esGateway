import KoaRouter from 'koa-router'
import controllers from '../controllers/index.js'

const router = new KoaRouter()

router
  .get('/hello', (ctx, next) => {
    ctx.body = 'Hello!'
  })
  .post('/es/search', controllers.es.search)
  .post('/git/commit', controllers.git.commit)

export default router;
