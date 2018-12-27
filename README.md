## luepack
### 介绍
简易的打包工具
### 使用
>1.全局安装npm包
```js
npm i -g luepack // 全局安装npm包
```
>2.在你要打包的项目配置`luepack.config.js`文件
```js
module.exports = {
  entry: './src/index.js',  // 入口文件
  output: './bundle.js' // 打包后卫的文件
}
```
>3.在项目目录下,执行luepack

### 参考
[实现一个简易的webpack](https://github.com/muwoo/blogs/issues/29)