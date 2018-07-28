const webpack = require('webpack')
const mergeWebpack = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const WebpackBar = require('webpackbar')

const config = require('./config')

exports.getWebpackConfig = ({ target }) => {
  const service = config.service
  const isProd = service.mode === 'production'

  let webpackConfig = service.resolveChainableWebpackConfig()

  webpackConfig.plugins.delete('html')
  webpackConfig.plugins.delete('hmr')
  webpackConfig.plugins.delete('preload')
  webpackConfig.plugins.delete('prefetch')
  webpackConfig.plugins.delete('pwa')
  webpackConfig.plugins.delete('progress')
  webpackConfig.plugins.delete('no-emit-on-errors')

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

  const isClient = target === 'client'
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
        whitelist: /\.css$/,
      }),
      output: {
        libraryTarget: 'commonjs2',
      },
      target: 'node',
      devtool: 'source-map',
    })

    delete webpackConfig.node
  }

  for (const rule of webpackConfig.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
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
