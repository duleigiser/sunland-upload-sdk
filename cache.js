/*
 * @Author: dulei
 * @Date: 2022-04-06 14:50:17
 * @LastEditors: dulei
 * @LastEditTime: 2022-04-06 14:54:32
 * @FilePath: /sunland-upload-sdk/cache.js
 * @Description: 
 * 
 * Copyright (c) 2022 by dulei, All Rights Reserved. 
 */
const fs = require("fs")
const fsPromise = fs.promises
const path = require("path")
const _md5RecordFilePath = 'record.json'
let md5RecordList = []
const md5 = require('md5')
/**
 * 判断文件是否存在
 * @param {*} file 
 * @returns 
 */
function isCacheFileExit(file) {
  return new Promise((reslove) => {
    fsPromise.access(file, fs.constants.R_OK | fs.constants.W_OK).then((res) =>
      reslove(true)
    ).catch(() => reslove(false));
  })
}
/**
 *
 *
 * @param {*} _path 缓存文件目录
 * @param {*} files 文件列表
 * @return {*} 
 */
async function cacheFile(_path, files) {
  let uncacheFiles = []
  let desDir = path.resolve(_path, _md5RecordFilePath)
  let hasCache = await isCacheFileExit(desDir)
  if(hasCache) {
    md5RecordList = JSON.parse(fs.readFileSync(desDir) || '[]')
  }
  files.map(async (item) => {
    let data = fs.readFileSync(item.file,'utf8')
    let mdString = md5(data)
    
    if(item.file.indexOf(_md5RecordFilePath)>-1) {
      return
    }
    if(md5RecordList.indexOf(mdString)>-1) {
      console.log(item.file, 'has cached' )
    } else {
      uncacheFiles.push(item)
      md5RecordList.push(mdString) // 记录到缓存中
    }
  })
  fs.writeFileSync(desDir, JSON.stringify(md5RecordList, null, 2))
  return uncacheFiles
}

module.exports = cacheFile