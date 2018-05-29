import Koa2 from 'koa'
import initMiddleWare from './middleware/initKoa'
import { System as SystemConfig } from './config'

const app = new Koa2()
initMiddleWare(app)
app.listen(SystemConfig.API_server_port)

console.log(
  `Now start API server on port ${SystemConfig.API_server_port}...`
)

export default app
