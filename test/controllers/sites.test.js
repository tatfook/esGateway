import {
  validateCreate,
  validateUpdate,
  validateSearch,
  getSearchDSL,
  wrapSearchResult
} from '../../src/controllers/sites'
import { MockContext } from '../helper/mockcontext'

describe('while creating a website', () => {
  describe('valid params', () => {
    let username = 'testuser'
    let sitename = 'testsite'
    let logoUrl = 'keepwork.logo.com'
    let desc = 'it is a nice website'
    let displayName = 'differentsitename'
    let url = `/${username}/${sitename}`

    test('1', () => {
      let ctx = new MockContext()
        .setReqBody({
          username: username,
          sitename: sitename,
          logoUrl: logoUrl,
          desc: desc
        })
      let site = validateCreate(ctx)
      expect(ctx.status).toBe(200)
      expect(site).toHaveProperty('username', username)
      expect(site).toHaveProperty('sitename', sitename)
      expect(site).toHaveProperty('url', url)
      expect(site).toHaveProperty('logoUrl', logoUrl)
      expect(site).toHaveProperty('desc', desc)
      expect(site).toHaveProperty('display_name', sitename)
      expect(site).toHaveProperty('update_time')
    })

    test('2', () => {
      let ctx = new MockContext()
        .setReqBody({
          username: username,
          sitename: sitename,
          logoUrl: logoUrl,
          desc: desc,
          displayName: displayName
        })
      let site = validateCreate(ctx)
      expect(ctx.status).toBe(200)
      expect(site).toHaveProperty('username', username)
      expect(site).toHaveProperty('sitename', sitename)
      expect(site).toHaveProperty('url', url)
      expect(site).toHaveProperty('logoUrl', logoUrl)
      expect(site).toHaveProperty('desc', desc)
      expect(site).toHaveProperty('display_name', displayName)
      expect(site).toHaveProperty('update_time')
    })
  })

  describe('invalid params', () => {
    test('1', () => {
      let ctx = new MockContext()
        .setReqBody({})
      validateCreate(ctx)
      expect(ctx.status).toBe(400)
      expect(ctx.errors).toEqual([
        { username: 'required' },
        { sitename: 'required' },
        { logoUrl: 'required' }
      ])
    })

    test('2', () => {
      let ctx = new MockContext()
        .setReqBody({
          username: 'a very long name asdasdsadasdasdasdasdasdasdasasdasadasdsadasdasdasdassdsad',
          sitename: 'testsite',
          logoUrl: 'it is not an url'
        })
      validateCreate(ctx)
      expect(ctx.status).toBe(400)
      expect(ctx.errors).toEqual([
        { username: 'invalid length' },
        { logoUrl: 'must be an url' }
      ])
    })

    test('3', () => {
      let ctx = new MockContext()
        .setReqBody({
          username: 'nam',
          sitename: 'testsite',
          logoUrl: 'it is not an url'
        })
      validateCreate(ctx)
      expect(ctx.status).toBe(400)
      expect(ctx.errors).toEqual([
        { username: 'invalid length' },
        { logoUrl: 'must be an url' }
      ])
    })
  })
})

describe('while updating a site', () => {
  test('valid params', () => {
    let username = 'testuser'
    let sitename = 'testsite'
    let logoUrl = 'keepwork.logo.com'
    let desc = 'it is a nice website'
    let displayName = 'differentsitename'
    let url = `/${username}/${sitename}`
    let ctx = new MockContext()
      .setParams({ id: Buffer.from(url).toString('base64') })
      .setReqBody({
        logoUrl: logoUrl,
        desc: desc,
        displayName: displayName
      })
    let site = validateUpdate(ctx)
    expect(ctx.status).toBe(200)
    expect(site).toHaveProperty('logoUrl', logoUrl)
    expect(site).toHaveProperty('desc', desc)
    expect(site).toHaveProperty('display_name', displayName)
    expect(site).toHaveProperty('update_time')
  })

  describe('invalid params', () => {
    test('1', () => {
      let ctx1 = new MockContext()
        .setParams({})
        .setReqBody({
          logoUrl: 'not an url'
        })
      validateUpdate(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { id: 'required' },
        { logoUrl: 'must be an url' }
      ])
    })

    test('2', () => {
      let ctx1 = new MockContext()
        .setParams({ id: 'not a base64' })
      validateUpdate(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
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
          size: 15,
          username: 'testuser'
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

  test('invalid params', () => {
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

describe('while generating DSL', () => {
  describe('getSearchDSL', () => {
    test('with username', () => {
      let ctx = new MockContext()
        .setQuery({
          q: 'test',
          username: 'testuser'
        })
      let DSL = getSearchDSL(ctx)
      expect(DSL).toEqual({
        query: {
          multi_match: {
            query: 'test',
            fields: ['sitename', 'display_name'],
            fuzziness: 'AUTO'
          }
        },
        highlight: {
          fields: {
            sitename: {},
            display_name: {}
          },
          pre_tags: '<span>',
          post_tags: '</span>'
        },
        post_filter: { term: { username: 'testuser' } }
      })
    })

    test('without username', () => {
      let ctx = new MockContext()
        .setQuery({
          q: 'test'
        })
      let DSL = getSearchDSL(ctx)
      expect(DSL).toEqual({
        query: {
          multi_match: {
            query: 'test',
            fields: ['sitename', 'display_name'],
            fuzziness: 'AUTO'
          }
        },
        highlight: {
          fields: {
            sitename: {},
            display_name: {}
          },
          pre_tags: '<span>',
          post_tags: '</span>'
        }
      })
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
        total: 154,
        max_score: 1,
        hits: [
          {
            _index: 'www_kw_websites',
            _type: 'websites',
            _id: 'asdasdasKdxvswd=',
            _score: 1,
            _source: {
              logoUrl: 'http://keepwork.com/wiki/assets/imgs/wiki_blank_template.png',
              username: 'testuser',
              sitename: 'testsite1',
              display_name: 'testsite1',
              desc: 'it a nice site',
              update_time: '2018-02-24 20:21:30'
            },
            highlight: {
              sitename: [
                '<span>testsite1</span>'
              ]
            }
          },
          {
            _index: 'www_kw_websites',
            _type: 'websites',
            _id: 'asdasdasKd1x=vswd=',
            _score: 1,
            _source: {
              logoUrl: 'http://keepwork.com/wiki/assets/imgs/wiki_blank_template.png',
              username: 'testuser',
              sitename: 'testsite2',
              display_name: 'testsite2',
              desc: 'it a nice site',
              update_time: '2018-02-24 20:21:30'
            },
            highlight: {
              sitename: [
                '<span>testsite2</span>'
              ]
            }
          }
        ]
      }
    }

    let wrappedResult = wrapSearchResult(data)
    expect(wrappedResult).toEqual({
      took: 6,
      total: 154,
      timed_out: false,
      hits: [
        {
          logoUrl: 'http://keepwork.com/wiki/assets/imgs/wiki_blank_template.png',
          username: 'testuser',
          sitename: 'testsite1',
          display_name: 'testsite1',
          desc: 'it a nice site',
          highlight: {
            sitename: [
              '<span>testsite1</span>'
            ]
          }
        },
        {
          logoUrl: 'http://keepwork.com/wiki/assets/imgs/wiki_blank_template.png',
          username: 'testuser',
          sitename: 'testsite2',
          display_name: 'testsite2',
          desc: 'it a nice site',
          highlight: {
            sitename: [
              '<span>testsite2</span>'
            ]
          }
        }
      ]
    })
  })
})
