const path = require("path")
const axios = require('axios')
const fs = require('fs')
const rq = require('request-promise-native')
const cacheFile = require('./cache');

const log = getLog();
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
 async function getToken(_url) {
  return await axios({
    url: `${_url}/sfs/getToken`, 
    method: 'GET', 
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
  return axios({
    url: url+ 'upload', 
    method: 'POST', 
    headers: {
      "content-type": "application/json",
      "version": "1.0", 
      "authorization": token
    },
    data
  })
}


async function uploadFiles(conf) {
  const { SDUrl, prefix, localPath, remotePath, apiPath } = conf
  // 获取文件列表
  let desDir = path.resolve(process.cwd(), localPath)
  let files = getFilesByDir(desDir, false, prefix, desDir)
  // 获取token
  // let {data: tokenInfo} = JSON.parse(await getToken(SDUrl,accessKey,secretKey))
  let {data:{ data: accessToken}}= await getToken(apiPath)
  log(`获取token成功' + ${JSON.stringify(accessToken)} \n`)
  // 过滤已缓存文件，生成cache
  files = await cacheFile(desDir, files)
  const asyncFunc = async () => {
    files.map(async (item,index) => {
      let  uploadUrl = await getUploadUrl(SDUrl,{"key": item.filePath, "authTimeout":6*100}, accessToken)
      await _upload(item, uploadUrl.data, remotePath, index)
    });

  };
  console.log(`1共 ${files.length-1}文件 `)
  asyncFunc()
}
const _upload = (item, uploadUrl, remotePath, index, retry = false) => {
  return new Promise(resolve=> {
    fs.createReadStream(item.file)
      .pipe(rq.put(uploadUrl.data.uploadUrl,{headers: uploadUrl.data.header, timeout:10000, agentOptions: {}}, 
        async function optionalCallback(err, httpResponse, body) {
          if(err) {
            await _upload(item, uploadUrl, remotePath, index, true) 
            log(`${uploadUrl.data.uploadUrl}   部署失败', ${err} \n`)
            if(retry) {
              console.log(index +' 重新上传成功')
            }
          }
          else 
            log(`success upload file: ${item.filePath}  =>  ${remotePath}${item.filePath} \n`);
        }
      )
    ).catch(()=> {
      console.log(index +' 上传失败, 重新上传！')
      _upload(item, uploadUrl, remotePath, index, true)
    })
  })
}


module.exports = uploadFiles