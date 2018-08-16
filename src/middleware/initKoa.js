import KoaBody from 'koa-body'
import KoaValidate from 'koa-validate'
import compose from 'koa-compose'
import { System as SystemConfig, logPath } from '../config'
import path from 'path'
import MainRoutes from '../routes/main-routes'
import ErrorRoutesCatch from './ErrorRoutesCatch'
import ErrorRoutes from '../routes/error-routes'
import bunyan from 'bunyan'

const env = process.env.NODE_ENV || 'development' // Current mode

const initRequest = (ctx, next) => {
  if (
    ctx.request.header.host.split(':')[0] === 'localhost' ||
    ctx.request.header.host.split(':')[0] === '127.0.0.1'
  ) {
    ctx.set('Access-Control-Allow-Origin', '*')
  } else {
    ctx.set('Access-Control-Allow-Origin', SystemConfig.HTTP_server_host)
  }
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Credentials', true) // 允许带上 cookie
  return next()
}

const initKoaBody = KoaBody({
  multipart: true,
  strict: false,
  formidable: {
    uploadDir: path.join(__dirname, '../../assets/uploads/tmp')
  },
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
})

const logger = bunyan.createLogger({
  name: 'es-gateway',
  streams: [
    {
      stream: process.stdout,
      level: 'info'
    },
    {
      type: 'rotating-file',
      path: logPath || '.',
      period: '1d',
      level: 'error',
      count: 3
    }
  ]
})

const initLogger = (ctx, next) => {
  ctx.logger = logger
  if (env === 'development') {
    const start = new Date()
    return next().then(() => {
      const ms = new Date() - start
      console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
  }
  return next()
}

const checkContentType = (ctx, next) => {
  if (ctx.is('application/json') || ctx.method === 'GET' || ctx.method === 'DELETE') {
    return next()
  }
  ctx.throw(400, 'Content-Type must be application/json')
}

let middleWares = [
  initLogger,
  initRequest,
  initKoaBody,
  ErrorRoutesCatch,
  checkContentType,
  MainRoutes.routes(),
  MainRoutes.allowedMethods(),
  ErrorRoutes()
]

export default (app) => {
  KoaValidate(app)
  app.logger = logger
  app.use(compose(middleWares))
}
