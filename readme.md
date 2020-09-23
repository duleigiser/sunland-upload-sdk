# 尚德上传文件夹到文件服务系统（批量上传）

## 安装
 ```sh
  npm install --save cossync
 ```
 ## 配置项
在项目根目录新建如下xxx.json

 ```json
 {
  "SDUrl": "https://sfs-api.shangdejigou.cn/api/auth/",
  "remotePath": "https://sfs-public.shangdejigou.cn/sunlands_back_freestudy",
  "accessKey": "xxx",
  "secretKey": "xxx",
  "prefix" : "/fe/ananas",
  "localPath" : "ananas"
}
 ```
  * `SDUrl` 获取文件系统接口地址
  * `remotePath` 文件系统配置的cdn地址
  * `accessKey` secretKey
  * `secretKey` secretKey
  * `prefix` 拼接到cdn网址后(一般为项目名称)
  * `localPath` 本地需要上传的路径