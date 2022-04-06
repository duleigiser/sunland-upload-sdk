const path = require("path")
const rq = require('request-promise-native')
const fs = require('fs')
const cacheFile = require('./cache')
var log = getLog();

/**
 * [getLog 打印信息函数]
 * @return {[function]} [description]
 */
function getLog(){
  return function(msg){
    process.stdout.write(msg);
  } 
}

/**
 * 
 * @param {*} dir 需要遍历目录
 * @param {*} outFiles [] 默认为空
 * @return {*} [filePath]
 */
function getFilesByDir(dir, outFiles, prefix, desDir ) {
  outFiles = outFiles || []
  const files = fs.readdirSync(dir);
  for(let i in files) {
    let name = dir + '/' + files[i]; // 绝对路径
    if (fs.statSync(name).isDirectory()) {
      getFilesByDir(name, outFiles, prefix, desDir)
    } else {
      outFiles.push({
        file: name,
        filePath: prefix + name.substr(desDir.length)
      })
    }
  }
  return outFiles
}

// 获取token
/**
 *
 * @param {*} url 尚德文件服务url
 * @param {*} accessKey 
 * @param {*} secretKey
 * @return {*} {"accessToken":"wfD07yvRa2P8x3IwW5mpJ+l4w+Y=","appid":"xxx","expiredTime":1600244424}
 */
async function getToken(url,accessKey,secretKey) {
  return await rq({
    url: url+ 'token', 
    method: 'POST', 
    headers: {"content-type": "application/json","version": "1.0"},
    body: JSON.stringify({accessKey,secretKey, timeout: 60* 60})
  })
}

// getUploadUrl
/**
 *
 *
 * @param {*} url 尚德文件服务url
 * @param {*} data {"key": filePath, "authTimeout":60*10}
 * @param {*} token 获取的token
 * @return {*} null
 */
async function getUploadUrl(url, data, token) {
  return JSON.parse(await rq({
    url: url+ '/upload', 
    method: 'POST', 
    headers: {
      "content-type": "application/json",
      "version": "1.0", 
      "authorization": token
    },
    body: JSON.stringify(data)
  }))
}

async function uploadFiles(conf) {
  const { SDUrl, accessKey, secretKey, prefix, localPath, remotePath } = conf
  // 获取文件列表
  let desDir = path.resolve(process.cwd(), localPath)
  let files = getFilesByDir(desDir, false, prefix, desDir)
  // 获取token
  let {data: tokenInfo} = JSON.parse(await getToken(SDUrl,accessKey,secretKey))
  log(`获取token成功' + ${JSON.stringify(tokenInfo)} \n`)
  // 过滤已缓存文件，生成cache
  files = await cacheFile(desDir, files)
  
  files.map(async (item) => {
    // 获取上传url
    let uploadUrl = await getUploadUrl(
        SDUrl,
        {"key": item.filePath, "authTimeout":60*10}, 
        tokenInfo.accessToken)

    // log(`获取uploadUrl成功 + ${JSON.stringify(uploadUrl)} \n`)
    fs.createReadStream(item.file)
      .pipe(rq.put(uploadUrl.data.uploadUrl,{headers: uploadUrl.data.header}, 
        function optionalCallback(err, httpResponse, body) {
          if(err) {
            log(`item.filePath+'    部署失败', ${err} \n`)
            throw err
          }
          else 
            log(`success upload file: ${item.filePath}  =>  ${remotePath}${item.filePath} \n`);
            // if (index === files.length - 1) log('seems all right! ))_)): haha \n')
        }
      )
    )
  })  
}
module.exports = uploadFiles