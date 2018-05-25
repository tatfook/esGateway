class ErrorHandler {
  static handle (ctx, err) {
    try {
      ctx.status = err.status
      ctx.body = { status: err.status }
      this[err.status](ctx, err)
    } catch (e) {
      console.log(e)
      this[500](ctx, err)
    }
  }

  static 400 (ctx, err) {
    ctx.body.error = {
      type: 'Bad Request',
      message: ctx.errors
    }
  }

  static 401 (ctx, err) {
    ctx.body.error = {
      type: 'Unauthorized',
      message: 'Protected resource, use Authorization header to get access.'
    }
  }

  static 404 (ctx, err) {
    ctx.body.error = {
      type: 'NotFound',
      message: err.message
    }
  }

  static 500 (ctx, err) {
    ctx.status = 500
    ctx.body = {
      status: 500,
      error: {
        type: 'Internal Server Error',
        message: 'An unknown error happened'
      }
    }
  }
}

export default function () {
  return function (ctx, next) {
    return next().catch((err) => {
      ErrorHandler.handle(ctx, err)
    })
  }
}
