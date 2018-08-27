// api to test:
// sitesRouter
//   .get('/search', controllers.sites.search)
//   .post('/', controllers.sites.create)
//   .put('/:id', controllers.sites.update)
//   .put('/:id/visibility', controllers.sites.updateVisibility)
//   .delete('/:id', controllers.sites.remove)

import createAgent from '../helper/superAgent'

const agent = createAgent()
const token = process.env.TEST_TOKEN

describe('get /sites/search', () => {
  test('success', async () => {
    let response = await agent
      .get('/sites/search?q=test&page=2&size=10')
      .set('Authorization', token)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('took')
    expect(response.body).toHaveProperty('total')
    expect(response.body).toHaveProperty('timed_out')
    expect(response.body).toHaveProperty('hits')
  })
})

describe('post /sites', () => {
  test('success', async () => {
    let page = {
      username: 'testuser',
      sitename: 'testsite',
      logoUrl: 'git.keepwork.com',
      desc: 'nice page'
    }
    let response = await agent
      .post('/sites')
      .send(page)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(response.status).toBe(201)
    expect(response.body.created).toBeTruthy()
  })
})

describe('put /sites/:id', () => {
  test('success', async () => {
    let id = encodeURIComponent('/user1/site1')
    let page = {
      content: 'It is a very nice page',
      displayName: 'nicesite',
      desc: 'best site',
      logoUrl: 'git.keepwork.com'
    }
    let response = await agent.put(`/sites/${id}`)
      .send(page)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(response.status).toBe(200)
    expect(response.body.updated).toBeTruthy()
  })
})

describe('delete /sites/:id', () => {
  test('success', async () => {
    let id = encodeURIComponent('/user1/site1')
    let response = await agent.delete(`/sites/${id}`)
      .set('Authorization', token)
    expect(response.status).toBe(200)
    expect(response.body.deleted).toBeTruthy()
  })
})

describe('put /:id/visibility', () => {
  test('success', async () => {
    let id = encodeURIComponent('/user1/site1')
    let page = {
      visibility: 'private'
    }
    let response = await agent.put(`/sites/${id}/visibility`)
      .send(page)
      .set('Accept', 'application/json')
      .set('Authorization', token)
    expect(response.status).toBe(200)
    expect(response.body.updated).toBeTruthy()
  })
})

afterAll(() => {
  agent.close()
})
