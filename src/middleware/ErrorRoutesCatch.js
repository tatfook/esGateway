class ErrorHandler {
  static handle (ctx, err) {
    try {
      ctx.logger.error(err)
      ctx.status = err.status
      ctx.body = {}
      this[err.status](ctx, err)
    } catch (handlerNotFountErr) {
      console.log(handlerNotFountErr)
      this[500](ctx, err)
    }
  }

  static 400 (ctx, err) {
    ctx.body.error = ctx.errors || err.message
  }

  static 401 (ctx, err) {
    ctx.body.error = 'Protected resource, use Authorization header to get access.'
  }

  static 404 (ctx, err) {
    ctx.body.error = err.message || 'Page not found'
  }

  static 409 (ctx, err) {
    ctx.body.error = err.message
  }

  static 500 (ctx, err) {
    ctx.status = 500
    ctx.body = {
      error: err.message || 'An unknown error happened'
    }
  }
}

export default (ctx, next) => {
  return next().catch(err => {
    ErrorHandler.handle(ctx, err)
  })
}
