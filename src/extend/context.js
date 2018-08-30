const isAdmin = user => {
  return user.roleId === 10
}

export const ensureAdmin = ctx => {
  const errMsg = 'Page not found'
  ctx.state = ctx.state || {}
  ctx.state.user = ctx.state.user || {}
  const notPermitted = !isAdmin(ctx.state.user)
  if (notPermitted) { ctx.throw(404, errMsg) }
  ctx.user = ctx.state.user
}
