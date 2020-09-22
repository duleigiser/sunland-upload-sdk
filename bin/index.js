#!/usr/bin/env node

const path = require("path")
const uploadFiles = require("../upload")
const version = require('../package.json').version
var conf = require(path.join(process.cwd(), 'uploadConf.json'))
if(!conf) {
  console.err('请在项目根目录配置uploadConf')
  return
} 
console.log(`---------- verson ${version}-------`)
console.log(`${conf.localPath} ====> ${conf.remotePath}, please wait...`)
uploadFiles(conf)
