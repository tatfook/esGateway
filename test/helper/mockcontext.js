import KoaValidate from 'koa-validate'

export class MockContext {
  constructor (req = {}, res = {}) {
    req.body = {}
    req.query = {}
    this.params = {}
    this.query = req.query
    this.request = req
    this.response = res
    this.status = 200
    this.app = {context: this}
    KoaValidate(this.app)
  }
  throw (status, message) {
    if (this.status !== 200) {
      return
    }
    this.status = status
    this.errMsg = message
  }

  setReqBody (body) {
    this.request.body = body
    return this
  }

  setParams (params) {
    this.params = params
    return this
  }

  setQuery (query) {
    this.query = query
    this.request.query = query
    return this
  }
}
