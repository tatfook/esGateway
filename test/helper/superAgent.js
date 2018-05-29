import Koa2 from 'koa'
import initMiddleWare from '../../src/middleware/initKoa'
import supertest from 'supertest'

let app = new Koa2()
initMiddleWare(app)

export default () => {
  const server = app.listen()
  const agent = supertest(server)
  agent.server = server
  agent.close = server.close.bind(server)
  return agent
}
