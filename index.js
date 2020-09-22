const path = require("path")
const uploadFiles = require("./bin/upload")
const version = require('./package.json').version
var conf = require(path.join(process.cwd(), 'uploadConf.json'))
if(!conf) {
  console.err('请在项目根目录配置uploadConf')
  return
} 
console.log(`---------- verson ${verson}-------`)
console.log(`dist ====> ${conf.remotePath}, please wait...`)
uploadFiles(conf)
