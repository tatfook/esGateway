import YamlService from '../services/yaml'
import MarkdownService from '../services/markdown'

const MARKDOWN_EXTENSION = 'md'
const YAML_EXTENSION = 'yml'

const fileExtension = path => {
  return path.split('.').pop()
}

export const commit = async ctx => {
  const { path, action, content, options } = ctx.request.body
  const fileType = fileExtension(path)
  if (MARKDOWN_EXTENSION === fileType) {
    // markdown parser
    console.log('commit markdown')
    const token = ctx.request.headers.authorization
    const result = await MarkdownService.commit(path, action, content, token)
    ctx.body = result
  } else if (YAML_EXTENSION === fileType) {
    // yaml parser
    console.log('commit yaml')
    const result = await YamlService.commit(path, action, content, options)
    ctx.body = result
  } else {
    // raise error
    ctx.logger.error('Failed to commit file to es: ' + path)
    ctx.body = {message: 'invalid file type'}
  }
}
