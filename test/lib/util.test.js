import { paginate, getDatetime } from '../../src/lib/util'

test('pagination', () => {
  expect(paginate({page: 1, per_page: 10})).toEqual([0, 10])
  expect(paginate({page: 2, per_page: 10})).toEqual([10, 10])
  expect(paginate({page: 2, per_page: 11})).toEqual([11, 11])
  expect(paginate({page: 3, per_page: 12})).toEqual([24, 12])
  expect(paginate({page: 3, per_page: 15})).toEqual([30, 15])
})

test('getDatetime', () => {
  let now = getDatetime()
  expect(now).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  )
})
