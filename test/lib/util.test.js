import { paginate, getDatetime } from '../../src/lib/util'

test('pagination', () => {
  expect(paginate(1, 10)).toEqual([0, 10])
  expect(paginate(2, 10)).toEqual([10, 10])
  expect(paginate(2, 11)).toEqual([11, 11])
  expect(paginate(3, 12)).toEqual([24, 12])
  expect(paginate(3, 15)).toEqual([30, 15])
})

test('getDatetime', () => {
  let now = getDatetime()
  expect(now).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  )
})
