#!/usr/bin/env node

const path = require("path")
const uploadFiles = require("../upload")
const version = require('../package.json').version
var conf = require(path.join(process.cwd(), 'uploadConf.json'))

console.log(`---------- version ${version}-------`)
console.log(`${conf.localPath} ====> ${conf.remotePath}, please wait...`)
uploadFiles(conf)
