import {
  validateCreate,
  validateUpdate,
  validateSearch,
  getSearchDSL,
  validateRemoveSite,
  validateUpdateVisibility,
  getRemoveSiteDSL,
  getUpdateVisibilityDSL
} from '../../src/controllers/pages'
import { MockContext } from '../helper/mockcontext'

describe('while creating a page', () => {
  describe('valid params', () => {
    let url = '/user/site/page'
    let sourceUrl = 'keepwork.com'
    let visibility = 'private'

    test('with visibility', () => {
      const ctx1 = new MockContext()
        .setReqBody({
          url: url,
          source_url: sourceUrl,
          visibility: visibility
        })
      const page = validateCreate(ctx1)
      expect(ctx1.status).toBe(200)
      expect(page).toHaveProperty('username', 'user')
      expect(page).toHaveProperty('sitename', 'site')
      expect(page).toHaveProperty('pagename', 'page')
      expect(page).toHaveProperty('source_url', sourceUrl)
      expect(page).toHaveProperty('visibility', 'private')
      expect(page).toHaveProperty('update_time')
    })

    test('without visibility', () => {
      const ctx2 = new MockContext()
        .setReqBody({
          url: url,
          source_url: sourceUrl
        })
      const page = validateCreate(ctx2)
      expect(ctx2.status).toBe(200)
      expect(page).toHaveProperty('username', 'user')
      expect(page).toHaveProperty('sitename', 'site')
      expect(page).toHaveProperty('pagename', 'page')
      expect(page).toHaveProperty('source_url', sourceUrl)
      expect(page).toHaveProperty('visibility', 'public')
      expect(page).toHaveProperty('update_time')
    })
  })

  describe('invalid params', () => {
    test('1', () => {
      const ctx1 = new MockContext()
      validateCreate(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { url: 'required' },
        { source_url: 'required' },
        { visibility: 'invalid' }
      ])
    })

    test('2', () => {
      const ctx2 = new MockContext()
        .setReqBody({
          url: 'sada/asdas/asdas',
          source_url: 'not a url',
          visibility: 'out of range'
        })
      validateCreate(ctx2)
      expect(ctx2.status).toBe(400)
      expect(ctx2.errors).toEqual([
        { url: 'invalid format' },
        { source_url: 'must be an url' },
        { visibility: 'invalid' }
      ])
    })
  })
})

describe('while updated a page', () => {
  test('valid params', () => {
    let url = '/user/site/page'
    let visibility = 'private'
    let content = 'it is a nice page'
    let tags = ['npl', 'es', 'lua', 'cs', 'nodejs']
    const ctx = new MockContext()
      .setParams({ id: encodeURIComponent(url) })
      .setReqBody({
        visibility: visibility,
        content: content,
        tags: tags
      })
    const page = validateUpdate(ctx)
    expect(ctx.status).toBe(200)
    expect(page).toHaveProperty('visibility', visibility)
    expect(page).toHaveProperty('content', content)
    expect(page).toHaveProperty('tags', tags)
    expect(page).toHaveProperty('update_time')
  })

  describe('invalid params', () => {
    test('1', () => {
      const ctx = new MockContext()
        .setParams({ id: encodeURIComponent('not a base64') })
        .setReqBody({
          visibility: 'invalid value',
          tags: ['it', 'is', 'over', 'than', 'five', 'members']
        })
      validateUpdate(ctx)
      expect(ctx.status).toBe(400)
      expect(ctx.errors).toEqual([
        { visibility: 'invalid' },
        { tags: 'Too many members' }
      ])
    })
  })
})

describe('while searching', () => {
  describe('valid params', () => {
    test('1', () => {
      const ctx = new MockContext()
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
      const ctx = new MockContext()
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
      const ctx1 = new MockContext()
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

describe('while deleting all pages of a site', () => {
  describe('valid params', () => {
    test('1', () => {
      const ctx = new MockContext()
        .setParams({ id: '/testuser/testsite' })
      validateRemoveSite(ctx)
      expect(ctx.status).toBe(200)
    })
  })

  describe('ivalid params', () => {
    test('1', () => {
      const ctx1 = new MockContext()
        .setParams({ id: encodeURIComponent('not a url') })
      validateRemoveSite(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { id: 'invalid' }
      ])
    })

    test('2', () => {
      const ctx2 = new MockContext()
      validateRemoveSite(ctx2)
      expect(ctx2.status).toBe(400)
      expect(ctx2.errors).toEqual([
        { id: 'required' }
      ])
    })
  })
})

describe('while updating all pages of a site', () => {
  describe('valid params', () => {
    test('1', () => {
      const ctx = new MockContext()
        .setParams({ id: '/testuser/testsite' })
        .setReqBody({ visibility: 'private' })
      validateUpdateVisibility(ctx)
      expect(ctx.status).toBe(200)
    })
  })

  describe('ivalid params', () => {
    test('1', () => {
      const ctx1 = new MockContext()
        .setParams({ id: encodeURIComponent('not a url') })
        .setReqBody({ visibility: 'out of range' })
      validateUpdateVisibility(ctx1)
      expect(ctx1.status).toBe(400)
      expect(ctx1.errors).toEqual([
        { id: 'invalid' },
        { visibility: 'invalid' }
      ])
    })

    test('2', () => {
      const ctx2 = new MockContext()
      validateUpdateVisibility(ctx2)
      expect(ctx2.status).toBe(400)
      expect(ctx2.errors).toEqual([
        { id: 'required' },
        { visibility: 'required' }
      ])
    })
  })
})

describe('while generating DSL', () => {
  describe('getSearchDSL', () => {
    test('with username', () => {
      const ctx = new MockContext()
        .setQuery({
          q: 'test',
          page: 5,
          size: 15,
          username: 'testuser'
        })
      const DSL = getSearchDSL(ctx)
      expect(DSL).toEqual({
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: 'test',
                  fields: [
                    'content',
                    'tags',
                    'username',
                    'sitename',
                    'pagename'
                  ],
                  fuzziness: 'AUTO'
                }
              }
            ],
            must_not: { match: { visibility: 'private' } }
          }
        },
        highlight: {
          fields: {
            content: {},
            tags: {},
            username: {},
            sitename: {},
            pagename: {}
          },
          pre_tags: '<span>',
          post_tags: '</span>'
        },
        post_filter: { term: { username: 'testuser' } }
      })
    })

    test('without username', () => {
      const ctx = new MockContext()
        .setQuery({
          q: 'test',
          page: 5,
          size: 15
        })
      const DSL = getSearchDSL(ctx)
      expect(DSL).toEqual({
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: 'test',
                  fields: [
                    'content',
                    'tags',
                    'username',
                    'sitename',
                    'pagename'
                  ],
                  fuzziness: 'AUTO'
                }
              }
            ],
            must_not: { match: { visibility: 'private' } }
          }
        },
        highlight: {
          fields: {
            content: {},
            tags: {},
            username: {},
            sitename: {},
            pagename: {}
          },
          pre_tags: '<span>',
          post_tags: '</span>'
        }
      })
    })
  })

  describe('getRemoveSiteDSL', () => {
    test('1', () => {
      const ctx = new MockContext()
        .setParams({ id: '/testuser/testsite' })
      validateRemoveSite(ctx)
      const DSL = getRemoveSiteDSL(ctx)
      expect(DSL).toEqual({
        query: {
          bool: {
            must: [
              { term: { username: 'testuser' } },
              { term: { sitename: 'testsite' } }
            ]
          }
        }
      })
    })
  })

  describe('getUpdateVisibilityDSL', () => {
    test('1', () => {
      const ctx = new MockContext()
        .setParams({ id: '/testuser/testsite' })
        .setReqBody({ visibility: 'private' })
      validateUpdateVisibility(ctx)
      const DSL = getUpdateVisibilityDSL(ctx)
      expect(DSL).toEqual({
        query: {
          bool: {
            must: [
              { term: { username: 'testuser' } },
              { term: { sitename: 'testsite' } }
            ]
          }
        },
        script: {
          source: `ctx._source.visibility = "private"`,
          lang: 'painless'
        }
      })
    })
  })
})
