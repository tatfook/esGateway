import {
  validateCreate,
  validateUpdate,
  validateSearch,
  getSearchDSL,
  wrapSearchResult
} from '../../src/controllers/users'
import { MockContext } from '../helper/mockcontext'

describe('while creating a user', () => {
  test('valid params', () => {
    let username = 'testuser1'
    let portrait = 'keepwork.com'
    let displayName = 'user1'
    let location = 'Shenzhen'
    let ctx = new MockContext()
      .setReqBody({
        username: username,
        portrait: portrait,
        displayName: displayName,
        location: location
      })
    let user = validateCreate(ctx)
    expect(ctx.status).toBe(200)
    expect(user).toHaveProperty('username', username)
    expect(user).toHaveProperty('suggestion', username)
    expect(user).toHaveProperty('display_name', displayName)
    expect(user).toHaveProperty('location', location)
    expect(user).toHaveProperty('portrait', portrait)
    expect(user).toHaveProperty('update_time')
  })

  describe('invalid params', () => {
    test('1', () => {
      let ctx1 = new MockContext()
        .setReqBody({
          username: '',
          portrait: ''
        })
      validateCreate(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { username: 'required' },
        { portrait: 'required' }
      ])
    })

    test('2', () => {
      let ctx2 = new MockContext()
        .setReqBody({
          username: 'a very long name whit many spaces, which is invalid',
          portrait: 'it is not an url'
        })
      validateCreate(ctx2)
      expect(ctx2.status).toBe(400)
      expect(ctx2.errors).toEqual([
        { username: 'invalid length' },
        { portrait: 'must be an url' }
      ])
    })

    test('3', () => {
      let ctx3 = new MockContext()
        .setReqBody({
          username: 'name whit many space',
          portrait: 'keepwork.com'
        })
      validateCreate(ctx3)
      expect(ctx3.status).toBe(400)
      expect(ctx3.errors).toEqual([
        { username: 'can not contains invalid chars' }
      ])
    })
  })
})

describe('while updating a user', () => {
  test('valid params', () => {
    let username = 'username'
    let id = Buffer.from(username).toString('base64')
    let portrait = 'keepwork.com'
    let displayName = 'user1'
    let location = 'Shenzhen'
    let ctx = new MockContext()
      .setParams({ id: id })
      .setReqBody({
        username: username,
        portrait: portrait,
        displayName: displayName,
        location: location
      })
    let user = validateUpdate(ctx)
    expect(ctx.status).toBe(200)
    expect(user).toHaveProperty('display_name', displayName)
    expect(user).toHaveProperty('location', location)
    expect(user).toHaveProperty('portrait', portrait)
    expect(user).toHaveProperty('update_time')
  })

  describe('invalid params', () => {
    test('1', () => {
      let ctx1 = new MockContext()
        .setReqBody({
          portrait: 'it is not an url'
        })
      validateUpdate(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { id: 'required' },
        { portrait: 'must be an url' }
      ])
    })

    test('2', () => {
      let ctx2 = new MockContext()
        .setParams({ id: 'not a base64' })
      validateUpdate(ctx2)
      expect(ctx2.status).toBe(400)
      expect(ctx2.errors).toEqual([
        { id: 'invalid' }
      ])
    })
  })
})

describe('while searching', () => {
  describe('valid params', () => {
    test('1', () => {
      let ctx = new MockContext()
        .setQuery({
          q: 'test',
          page: 5,
          size: 15
        })
      validateSearch(ctx)
      expect(ctx.status).toBe(200)
    })

    test('2', () => {
      let ctx = new MockContext()
        .setQuery({
          q: 'test'
        })
      validateSearch(ctx)
      expect(ctx.status).toBe(200)
      expect(ctx.query.page).toBe(1)
      expect(ctx.query.size).toBe(20)
    })
  })

  describe('invalid params', () => {
    test('1', () => {
      let ctx1 = new MockContext()
        .setQuery({
          page: 'asdasd',
          size: 'asdasd'
        })
      validateSearch(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { q: 'required' },
        { page: 'must be an int' },
        { size: 'must be an int' }
      ])
    })
  })
})

describe('while generating DSL', () => {
  test('getSearchDSL', () => {
    let ctx = new MockContext()
      .setQuery({
        q: 'test'
      })
    let DSL = getSearchDSL(ctx)
    expect(DSL).toEqual({
      query: {
        multi_match: {
          query: 'test',
          fields: ['username', 'display_name'],
          fuzziness: 'AUTO'
        }
      },
      highlight: {
        fields: {
          username: {},
          display_name: {}
        },
        pre_tags: '<span>',
        post_tags: '</span>'
      }
    })
  })
})

describe('while wrapping search result', () => {
  test('valid data', () => {
    let data = {
      took: 6,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 30,
        max_score: 1,
        hits: [
          {
            _index: 'www_kw_websites',
            _type: 'websites',
            _id: 'asdasdasKdxvswd=',
            _score: 1,
            _source: {
              username: 'testuser',
              suggestion: 'testuser',
              display_name: 'testuser',
              portrait: 'sadasd.test.com',
              update_time: '2018-02-24 20:21:30'
            },
            highlight: {
              display_name: [
                '<span>testuser</span>'
              ],
              username: [
                '<span>testuser</span>'
              ]
            }
          }
        ]
      }
    }

    let wrappedResult = wrapSearchResult(data)
    expect(wrappedResult).toEqual({
      took: 6,
      total: 30,
      timed_out: false,
      hits: [
        {
          username: 'testuser',
          suggestion: 'testuser',
          display_name: 'testuser',
          portrait: 'sadasd.test.com',
          highlight: {
            display_name: [
              '<span>testuser</span>'
            ],
            username: [
              '<span>testuser</span>'
            ]
          }
        }
      ]
    })
  })
})
