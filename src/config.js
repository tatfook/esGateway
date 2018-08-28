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

  API_url_prifix: process.env.API_PREFIX || '',

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
  Es_Base_URL: process.env.ES_BASE_URL,
  Es_Version: process.env.ES_VERSION,
  Es_Indexes: {
    pages: 'pages',
    sites: 'sites',
    users: 'users'
  },
  KeepWork_API_Base_URL: process.env.KEEPWORK_API_BASE_URL
}

export const jwt = {
  secret: process.env.SECRET,
  passthrough: true
}

export const logPath = 'logs/es-gateway.log'
