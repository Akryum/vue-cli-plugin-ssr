const webpack = require('webpack')
const mergeWebpack = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const WebpackBar = require('webpackbar')

const config = require('./config')
const HtmlFilterPlugin = require('./plugins/HtmlFilterPlugin')
const CssContextLoader = require.resolve('./loaders/css-context')

exports.getWebpackConfig = ({ target }) => {
  const service = config.service
  const isProd = service.mode === 'production'
  const isClient = target === 'client'

  let webpackConfig = service.resolveChainableWebpackConfig()

  // Remove unneeded plugins
  webpackConfig.plugins.delete('hmr')
  webpackConfig.plugins.delete('preload')
  webpackConfig.plugins.delete('prefetch')
  webpackConfig.plugins.delete('progress')
  webpackConfig.plugins.delete('no-emit-on-errors')

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
          // Critical CSS
          rule.use('css-context').loader(CssContextLoader).before('css-loader')
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
      return args
    })
  }

  webpackConfig = service.resolveWebpackConfig(webpackConfig)

  webpackConfig = mergeWebpack(webpackConfig, {
    entry: config.entry(target),
    plugins: [
      new webpack.DefinePlugin({
        'process.client': target === 'client',
        'process.server': target === 'server',
      }),
      new webpack.NoEmitOnErrorsPlugin(),
    ],
    stats: isProd ? 'normal' : 'none',
    devServer: {
      stats: 'errors-only',
      quiet: true,
      noInfo: true,
    },
  })

  if (isClient) {
    webpackConfig = mergeWebpack(webpackConfig, {
      plugins: [
        new VueSSRClientPlugin(),
        new WebpackBar({
          name: 'Client',
          color: 'green',
        }),
      ],
      devtool: !isProd ? '#cheap-module-source-map' : undefined,
    })
  } else {
    webpackConfig = mergeWebpack(webpackConfig, {
      plugins: [
        new VueSSRServerPlugin(),
        new WebpackBar({
          name: 'Server',
          color: 'orange',
        }),
      ],
      externals: nodeExternals({
        whitelist: config.nodeExternalsWhitelist,
      }),
      output: {
        libraryTarget: 'commonjs2',
      },
      target: 'node',
      devtool: 'source-map',
      optimization: {
        splitChunks: false,
        minimize: false,
      },
    })

    delete webpackConfig.node
  }

  for (const rule of webpackConfig.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
        item.options = item.options || {}
        if (item.loader === 'cache-loader' && !isClient) {
          // Change cache directory for server-side
          item.options.cacheIdentifier += '-server'
          item.options.cacheDirectory += '-server'
        } else if (item.loader === 'vue-loader') {
          // Optimize SSR only on server-side
          if (isClient) {
            item.options.optimizeSSR = false
          } else {
            item.options.cacheIdentifier += '-server'
            item.options.cacheDirectory += '-server'
            item.options.optimizeSSR = true
          }
        }
      }
    }
  }

  return webpackConfig
}
