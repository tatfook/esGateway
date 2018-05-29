import moment from 'moment'

export const paginate = (page, size) => {
  return [(page - 1) * size, size]
}

export const getDatetime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss')
}
