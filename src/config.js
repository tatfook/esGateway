import path from 'path'
import dotenv from 'dotenv'

let option

// 测试环境中，环境变量写入.env.test文件中
if (process.env.NODE_ENV === 'test') {
  option = { path: path.resolve(process.cwd(), '.env.test') }
}
const result = dotenv.config(option)
if (result.error) { throw result.error }

// 系统配置
export let System = {
  // API服务器协议类型,包含"http://"或"https://"
  API_server_type: process.env.API_SERVER_TYPE,

  // API服务器暴露的域名地址,请勿添加"http://"
  API_server_host: process.env.API_SERVER_HOST,

  // API服务器监听的端口号
  API_server_port: process.env.API_SERVER_PORT,

  // HTTP服务器协议类型,包含"http://"或"https://"
  HTTP_server_type: process.env.HTTP_SERVER_TYPE,

  // HTTP服务器地址,请勿添加"http://" （即前端调用使用的服务器地址，如果是APP请设置为 * ）
  HTTP_server_host: process.env.HTTP_SERVER_HOST,

  // HTTP服务器端口号
  HTTP_server_port: process.env.HTTP_SERVER_PORT,

  // 所在国家的国家代码
  System_country: process.env.SYSTEM_COUNTRY,

  // 插件路径
  System_plugin_path: path.join(__dirname, './plugins'),

  // 生产环境务必随机设置一个值
  Session_Key: process.env.SESSION_KEY,
  Es_Base_URL: process.env.ES_BASE_URL,
  Es_Version: process.env.ES_VERSION,
  KeepWork_API_Base_URL: process.env.KEEPWORK_API_BASE_URL,
  KeepWork_ENV: process.env.KEEPWORK_ENV
}

export const urlPrefix = '/v0'

export const logPath = 'logs/es-gateway.log'

export let DB = {
  host: 'localhost', // 服务器地址
  port: 3306, // 数据库端口号
  username: 'admin', // 数据库用户名
  password: 'admin888', // 数据库密码
  database: 'development', // 数据库名称
  prefix: 'api_' // 默认"api_"
}
