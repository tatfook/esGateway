import yamlService from '../services/yaml'

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
  } else if (YAML_EXTENSION === fileType) {
    // yaml parser
    await yamlService.commit(path, action, content, options)
    ctx.body = {message: 'succeed!'}
  } else {
    // raise error
  }
}
