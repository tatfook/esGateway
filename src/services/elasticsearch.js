import elasticsearch from 'elasticsearch'
import { System as SystemConfig } from '../config'

const esClient = new elasticsearch.Client({
  host: SystemConfig.Es_Base_URL,
  apiVersion: SystemConfig.Es_Version,
  log: 'info',
  requestTimeout: 1000
})

export default esClient
