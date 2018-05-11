import yaml from 'js-yaml'
import elasticsearch from 'elasticsearch'
import { System as SystemConfig } from '../config'

const esClient = new elasticsearch.Client({ host: SystemConfig.Es_Base_URL })
const SPLIT_CHAR = '.'

class yamlDB {
  static tableIndex (t) {
    return [t.prefix, t.tableName, t.version].join(SPLIT_CHAR)
  }

  static getPathData (path) {
    const reg = /^__data__\/([^\/]+)\/(.+)\.yml$/
    const paths = path.match(reg)

    if (!paths) return

    const index = paths[1]
    const key = paths[2]

    const indexes = index.split(SPLIT_CHAR)

    if (indexes.length !== 3) {
      return
    }
    const prefix = indexes[0] && indexes[0]
    const tableName = indexes[1] && indexes[1]
    const version = indexes[2] && indexes[2]
    return {key, prefix, tableName, version}
  }

  static async commit (path, action, content, options) {
    const data = this.getPathData(path)
    if (!data) return

    const esData = {
      index: this.tableIndex(data),
      type: data.tableName,
      id: data.key,
      body: yaml.safeLoad(content) || {}
    }
    esData.body.path = path

    try {
      return (esClient[action])(esData)
    } catch (e) {
      console.error(e)
    }
  }
}

const commit = async (path, action, content, options) => {
  // currently only support yamldb
  return yamlDB.commit(path, action, content, options)
}

export default {
  commit
}
