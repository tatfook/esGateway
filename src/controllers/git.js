const MARKDOWN_EXTENSION = '.md'
const YAML_EXTENSION = '.yml'

const fileExtension = path => {
  return '.md'
}

export const commit = async ctx => {
  const { path, action, content, options } = ctx.params
  const fileType = fileExtension(path)
  if (MARKDOWN_EXTENSION === fileType) {
    // markdown parser
  } else if (YAML_EXTENSION === fileType) {
    // yaml parser
  } else {
    // raise error
  }
}
