import { System } from '../src/config'

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
  expect(System).toHaveProperty('Es_Indexes')
})
