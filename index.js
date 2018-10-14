const webpack = require('webpack')
const formatStats = require('@vue/cli-service/lib/commands/build/formatStats')
const rimraf = require('rimraf')

const { getWebpackConfig } = require('./lib/webpack')
const { createServer } = require('./lib/server')
const config = require('./lib/config')
const defaultConfig = require('./lib/default-config')

module.exports = (api, options) => {
  // Config
  Object.assign(config, defaultConfig(api, options), options.pluginOptions && options.pluginOptions.ssr)

  config.api = api
  const service = config.service = api.service

  api.chainWebpack(webpackConfig => {
    // Default entry
    webpackConfig.entry('app').clear().add(config.entry('client'))
  })

  api.registerCommand('ssr:build', {
    description: 'build for production (SSR)',
  }, async (args) => {
    const options = service.projectOptions

    rimraf.sync(api.resolve(config.distPath))

    const clientConfig = getWebpackConfig({ service, target: 'client' })
    const serverConfig = getWebpackConfig({ service, target: 'server' })

    const compiler = webpack([clientConfig, serverConfig])
    const onCompilationComplete = (err, stats) => {
      if (err) {
        // eslint-disable-next-line
        console.error(err.stack || err)
        if (err.details) {
          // eslint-disable-next-line
          console.error(err.details)
        }
        return
      }

      if (stats.hasErrors()) {
        stats.toJson().errors.forEach(err => console.error(err))
        process.exitCode = 1
      }

      if (stats.hasWarnings()) {
        stats.toJson().warnings.forEach(warn => console.warn(warn))
      }

      try {
        // eslint-disable-next-line
        console.log(formatStats(stats, options.outputDir, api));
      } catch (e) {
      }
    }

    if (args.watch) {
      compiler.watch({}, onCompilationComplete)
    } else {
      compiler.run(onCompilationComplete)
    }
  })

  api.registerCommand('ssr:serve', {
    description: 'Run the included server.',
    usage: 'vue-cli-service serve:ssr [options]',
    options: {
      '-p, --port [port]': 'specify port',
      '-h, --host [host]': 'specify host',
    },
  }, async (args) => {
    let port = args.port || config.port || process.env.PORT
    if (!port) {
      const portfinder = require('portfinder')
      port = await portfinder.getPortPromise()
    }

    const host = args.host || config.host || process.env.HOST || 'localhost'

    config.port = port
    config.host = host

    await createServer({
      port,
      host,
    })
  })
}

module.exports.defaultModes = {
  'ssr:build': 'production',
  'ssr:server': 'development',
}

module.exports.ssrMiddleware = require('./lib/app')
