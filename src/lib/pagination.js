const paginate = (page, size) => {
  return [(page - 1) * size, size]
}

export default paginate
