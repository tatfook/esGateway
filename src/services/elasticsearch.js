import elasticsearch from 'elasticsearch'
import { System as SystemConfig } from '../config'

const getClient = () => {
  return new elasticsearch.Client({
    host: SystemConfig.Es_Base_URL,
    apiVersion: SystemConfig.Es_Version
  })
}

export default getClient
