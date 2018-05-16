import { Page } from './keepwork'

class MdPage {
  // TODO
  // Add new page parser and remove keepwork API
  static async commit (path, action, content, token) {
    path = '/' + path.replace(/.md$/, '')
    if (action === 'create' || action === 'edit') {
      Page.upsert({
        url: path,
        content: content
      }, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        console.log('yeap')
        return res
      }).catch(e => {
        console.error(e.message)
      })
    } else if (action === 'delete') {
      Page.delete({
        url: path
      }, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        console.log('yeap')
        return res
      }).catch(e => {
        console.error(e.message)
      })
    }
  }
}

const commit = async (path, action, content, token) => {
  // currently only support MdPage
  return MdPage.commit(path, action, content, token)
}

export default {
  commit
}
