import moment from 'moment'

export const paginate = (query) => {
  return [(query.page - 1) * query.per_page, query.per_page]
}

export const getDatetime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss')
}
