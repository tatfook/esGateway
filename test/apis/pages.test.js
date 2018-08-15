// api to test:
// pagesRouter
//   .get('/search', controllers.pages.search)
//   .post('/', controllers.pages.create)
//   .put('/:id', controllers.pages.update)
//   .delete('/:id', controllers.pages.remove)

import createAgent from '../helper/superAgent'

const agent = createAgent()

describe('get /pages/search', () => {
  test('success', async () => {
    let response = await agent
      .get('/v0/pages/search?q=test&page=2&size=10')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('took')
    expect(response.body).toHaveProperty('total')
    expect(response.body).toHaveProperty('timed_out')
    expect(response.body).toHaveProperty('hits')
  })
})

describe('post /pages', () => {
  test('success', async () => {
    let page = {
      url: '/user1/site1/page1',
      source_url: 'git.keepwork.com',
      visibility: 'public'
    }
    let response = await agent
      .post('/v0/pages')
      .send(page)
      .set('Accept', 'application/json')
    expect(response.status).toBe(201)
    expect(response.body.created).toBeTruthy()
  })
})

describe('put /pages/:id', () => {
  test('success', async () => {
    let id = encodeURIComponent('/user1/site1/page1')
    let page = {
      content: 'It is a very nice page',
      tags: ['cs', 'nodejs']
    }
    let response = await agent
      .put(`/v0/pages/${id}`)
      .send(page)
      .set('Accept', 'application/json')
    expect(response.status).toBe(200)
    expect(response.body.updated).toBeTruthy()
  })
})

describe('delete /pages/:id', () => {
  test('success', async () => {
    let id = encodeURIComponent('/user1/site1/page1')
    let response = await agent
      .delete(`/v0/pages/${id}`)
    expect(response.status).toBe(200)
    expect(response.body.deleted).toBeTruthy()
  })
})

afterAll(() => {
  agent.close()
})
