const path = require('path')
const loaderUtils = require('loader-utils')
const hash = require('hash-sum')
const qs = require('querystring')

module.exports = function () {}

module.exports.pitch = function (remainingRequest) {
  const isServer = this.target === 'node'
  const isProduction = this.minimize || process.env.NODE_ENV === 'production'

  const addStylesServerPath = loaderUtils.stringifyRequest(this, '!vue-style-loader/lib/addStylesServer.js')

  const request = loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)
  const relPath = path.relative(__dirname, this.resourcePath).replace(/\\/g, '/')
  const id = JSON.stringify(hash(request + relPath))
  const options = loaderUtils.getOptions(this) || {}

  // direct css import from js --> direct, or manually call `styles.__inject__(ssrContext)` with `manualInject` option
  // css import from vue file --> component lifecycle linked
  // style embedded in vue file --> component lifecycle linked
  const isVue = (
    /"vue":true/.test(remainingRequest) ||
    options.manualInject ||
    qs.parse(this.resourceQuery.slice(1)).vue != null
  )

  if (isServer && isProduction) {
    const shared = [
      '// load the styles',
      `var content = require(${request});`,
      // content list format is [id, css, media, sourceMap]
      'if(typeof content === \'string\') content = [[module.id, content, \'\']];',
      'module.exports = content;',
      'if(content.locals) module.exports = content.locals;',
    ]
    // on the server: attach to Vue SSR context
    if (isVue) {
      // inside *.vue file: expose a function so it can be called in
      // component's lifecycle hooks
      return shared.concat([
        '// add CSS to SSR context',
        `var add = require(${addStylesServerPath}).default`,
        'module.exports.__inject__ = function (context) {',
        `  add(${id}, content, ${isProduction}, context)`,
        '};',
      ]).join('\n')
    } else {
      // normal import
      return shared.concat([
        `require(${addStylesServerPath}).default(${id}, content, ${isProduction});`,
      ]).join('\n')
    }
  }
  return `module.exports = require(${remainingRequest})`
}
