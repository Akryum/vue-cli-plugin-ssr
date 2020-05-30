const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const WebpackBar = require('webpackbar')

const config = require('./config')
const HtmlFilterPlugin = require('./plugins/HtmlFilterPlugin')
const CssContextLoader = require.resolve('./loaders/css-context')

exports.chainWebpack = (webpackConfig) => {
  const target = process.env.VUE_CLI_SSR_TARGET
  if (!target) return
  const isClient = target === 'client'
  const isProd = process.env.NODE_ENV === 'production'
  const modernMode = !!process.env.VUE_CLI_MODERN_MODE
  const modernBuild = !!process.env.VUE_CLI_MODERN_BUILD

  // Remove unneeded plugins
  webpackConfig.plugins.delete('hmr')
  webpackConfig.plugins.delete('preload')
  webpackConfig.plugins.delete('prefetch')
  webpackConfig.plugins.delete('progress')
  if (!isProd) webpackConfig.plugins.delete('no-emit-on-errors')

  if (!isClient) {
    webpackConfig.plugins.delete('friendly-errors')

    const isExtracting = webpackConfig.plugins.has('extract-css')
    if (isExtracting) {
      // Remove extract
      const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
      const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
      for (const lang of langs) {
        for (const type of types) {
          const rule = webpackConfig.module.rule(lang).oneOf(type)
          rule.uses.delete('extract-css-loader')
          if (config.criticalCSS) {
            rule.use('css-context').loader(CssContextLoader).before('css-loader')
          }
        }
      }
      webpackConfig.plugins.delete('extract-css')
    }
  }

  // HTML
  webpackConfig.plugin('html-filter').use(HtmlFilterPlugin)
  if (isProd) {
    webpackConfig.plugin('html').tap(args => {
      args[0].minify.removeComments = false
      args[0].minify.caseSensitive = true
      return args
    })
  }

  const htmlPlugin = webpackConfig.plugins.get('html').store
  webpackConfig.plugin('html-ssr').use(htmlPlugin.get('plugin'), [
    {
      ...htmlPlugin.get('args')[0],
      template: config.api.resolve('public/index.ssr.html'),
      filename: 'index.ssr.html',
    },
  ])

  webpackConfig.entry('app').clear().add(config.entry(target))

  webpackConfig.plugin('define').tap(args => {
    return [Object.assign(args[0], { 'process.client': target === 'client', 'process.server': target === 'server' })]
  })

  webpackConfig.stats(isProd ? 'normal' : 'none')
  webpackConfig.devServer.stats('errors-only').quiet(true).noInfo(true)

  if (isClient) {
    webpackConfig.plugin('ssr').use(VueSSRClientPlugin)

    webpackConfig.devtool(!isProd ? '#cheap-module-source-map' : undefined)

    webpackConfig.module.rule('vue').use('vue-loader').tap(options => {
      options.optimizeSSR = false
      return options
    })

    if (modernMode) {
      const ModernModePlugin = require('@vue/cli-service/lib/webpack/ModernModePlugin')
      const targetDir = webpackConfig.output.get('path')
      if (!modernBuild) {
        webpackConfig.plugin('loader').use(WebpackBar, [{ name: 'Client (legacy)', color: 'green' }])

        webpackConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [{
          isModernBuild: false,
          targetDir,

        }])
      } else {
        webpackConfig.plugin('loader').use(WebpackBar, [{ name: 'Client (modern)', color: 'lightgreen' }])

        webpackConfig.plugin('modern-mode-modern').use(ModernModePlugin, [{
          isModernBuild: true,
          targetDir,
          jsDirectory: 'js',
        }])
      }
    } else {
      webpackConfig.plugin('loader').use(WebpackBar, [{ name: 'Client', color: 'green' }])
    }
  } else {
    webpackConfig.plugin('ssr').use(VueSSRServerPlugin)
    webpackConfig.plugin('loader').use(WebpackBar, [{ name: 'Server', color: 'orange' }])

    webpackConfig.devtool('source-map')
    webpackConfig.externals(nodeExternals({ whitelist: config.nodeExternalsWhitelist }))
    webpackConfig.output.libraryTarget('commonjs2'); webpackConfig.target('node')
    webpackConfig.optimization.splitChunks(false).minimize(false)

    webpackConfig.node.clear()

    webpackConfig.module.rule('vue').use('cache-loader').tap(options => {
      // Change cache directory for server-side
      options.cacheIdentifier += '-server'
      options.cacheDirectory += '-server'
      return options
    })

    webpackConfig.module.rule('vue').use('vue-loader').tap(options => {
      options.cacheIdentifier += '-server'
      options.cacheDirectory += '-server'
      options.optimizeSSR = !isClient
      return options
    })
  }
}

exports.getWebpackConfigs = (service) => {
  process.env.VUE_CLI_MODE = service.mode
  process.env.VUE_CLI_SSR_TARGET = 'client'
  process.env.VUE_CLI_MODERN_MODE = true
  delete process.env.VUE_CLI_MODERN_BUILD
  const clientConfigLegacy = service.resolveWebpackConfig()
  process.env.VUE_CLI_MODERN_BUILD = true
  const clientConfigModern = service.resolveWebpackConfig()
  delete process.env.VUE_CLI_MODERN_MODE
  delete process.env.VUE_CLI_MODERN_BUILD
  process.env.VUE_CLI_SSR_TARGET = 'server'
  const serverConfig = service.resolveWebpackConfig()
  return [clientConfigLegacy, clientConfigModern, serverConfig]
}
