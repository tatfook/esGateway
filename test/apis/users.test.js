// api to test:
// usersRouter
//   .get('/search', controllers.users.search)
//   .post('/', controllers.users.create)
//   .put('/:id', controllers.users.update)
//   .delete('/:id', controllers.users.remove)

import createAgent from '../helper/superAgent'

const agent = createAgent()

describe('get /users/search', () => {
  test('success', async () => {
    let response = await agent
      .get('/users/search?q=test&page=2&size=10')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('took')
    expect(response.body).toHaveProperty('total')
    expect(response.body).toHaveProperty('timed_out')
    expect(response.body).toHaveProperty('hits')
  })
})

describe('post /users', () => {
  test('success', async () => {
    let user = {
      username: 'test',
      portrait: 'keepwork.com',
      location: 'shenzhen'
    }
    let response = await agent
      .post('/users')
      .send(user)
      .set('Accept', 'application/json')
    expect(response.status).toBe(201)
    expect(response.body.created).toBeTruthy()
  })
})

describe('put /users/:id', () => {
  test('success', async () => {
    let id = Buffer.from('test').toString('base64')
    let user = {
      portrait: 'keepwork.com',
      displayName: 'testusername',
      location: 'shenzhen'
    }
    let response = await agent
      .put(`/users/${id}`)
      .send(user)
      .set('Accept', 'application/json')
    expect(response.status).toBe(200)
    expect(response.body.updated).toBeTruthy()
  })
})

describe('delete /users/:id', () => {
  test('success', async () => {
    let id = Buffer.from('test').toString('base64')
    let response = await agent
      .delete(`/users/${id}`)
    expect(response.status).toBe(200)
    expect(response.body.deleted).toBeTruthy()
  })
})

afterAll(() => {
  agent.close()
})