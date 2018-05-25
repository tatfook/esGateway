export default function () {
  return function (ctx, next) {
    switch (ctx.status) {
      case 404:
        ctx.throw(404, 'Page Not Found')
        break
    }
    return next()
  }
}
