import { System, DB } from '../src/config'

test('system config', () => {
  expect(System).toHaveProperty('API_server_type')
  expect(System).toHaveProperty('API_server_host')
  expect(System).toHaveProperty('API_server_port')
  expect(System).toHaveProperty('HTTP_server_type')
  expect(System).toHaveProperty('HTTP_server_host')
  expect(System).toHaveProperty('HTTP_server_port')
  expect(System).toHaveProperty('System_country')
  expect(System).toHaveProperty('System_plugin_path')
  expect(System).toHaveProperty('Es_Base_URL')
  expect(System).toHaveProperty('Es_Version')
  expect(System).toHaveProperty('KeepWork_API_Base_URL')
  expect(System).toHaveProperty('KeepWork_ENV')
})

test('db config', () => {
  expect(DB).toHaveProperty('host')
  expect(DB).toHaveProperty('port')
  expect(DB).toHaveProperty('username')
  expect(DB).toHaveProperty('password')
  expect(DB).toHaveProperty('database')
  expect(DB).toHaveProperty('prefix')
})
