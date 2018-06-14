import axios from 'axios'
import { System as SystemConfig } from '../config'

const client = axios.create({
  baseURL: SystemConfig.KeepWork_API_Base_URL
})

export const Page = {
  upsert: (params, config) => client.post('/pages/updateContent', params, config),
  delete: (params, config) => client.post('/pages/delete', params, config)
}
