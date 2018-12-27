#!/usr/bin/env node
const fs = require('fs')
const {transformFromAst} = require('babel-core')
const babylon = require('babylon')
const path = require('path')
const traverse = require('babel-traverse').default

let config = {}

/**
 * 解析成ast
 * @param {*} filename
 * @returns
 */
function getAst(filename) {
  const content = fs.readFileSync(filename, 'utf-8')
  return babylon.parse(content, {
    sourceType: 'module',
  })
}

/**
 * 编译
 * @param {*} ast
 * @returns
 */
function getTranslateCode(ast) {
  const {
    code
  } = transformFromAst(ast, null, {
    presets: ['env']
  })
  return code
}


function getDependence (ast) {
  let dependencies = []
  traverse(ast, {
    ImportDeclaration: ({node}) => {  // node代表当前节点
      dependencies.push(node.source.value)
    }
  })
  return dependencies
}


function parse (fileName, entry) {
  let filePath = fileName.indexOf('.js') === -1 ?fileName + '.js' : fileName
  let dirName = entry ? '': path.dirname(config.entry)
  let absoultePath = path.join(dirName, filePath)
  const ast = getAst(absoultePath)
  return {
    fileName,
    dependence: getDependence(ast),
    code: getTranslateCode(ast)
  }
}


function getQueue(main) {
  let queue = [main]
  for (let asset of queue) {
    asset.dependence.forEach(dep => {
      let child = parse(dep)
      queue.push(child)
    })
  }
  return queue
}

function bundle(queue) {
  let modules = ''
  queue.forEach(mod => {
    modules += `'${mod.fileName}': (function (require, module, exports) { ${mod.code}}),`
  })
  const result = `
  (function(modules){
    function require(fileName){
      const fn = modules[fileName];

      const module = {exports: {}};

      fn(require, module, module.exports);

      return module.exports;
    }

    require('${config.entry}');
  })({${modules}})
`
  return result
}

function bundleFile (option) {
  config = option
  let mainFile = parse(config.entry, true)
  
  let queue = getQueue(mainFile)
  return bundle(queue)
}

module.exports = bundleFile