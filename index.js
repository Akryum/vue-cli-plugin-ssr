const path = require('path')
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
        console.error(err);
        return
      }
      // eslint-disable-next-line
      console.log(formatStats(stats, options.outputDir, api));
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
      '--port [port]': 'specify port',
    },
  }, async (args) => {
    let port = args.port || config.port || process.env.PORT
    if (!port) {
      const portfinder = require('portfinder')
      port = await portfinder.getPortPromise()
    }

    config.port = port

    await createServer({
      port,
    })
  })
}

module.exports.defaultModes = {
  'ssr:build': 'production',
  'ssr:server': 'development',
}

module.exports.ssrMiddleware = require('./lib/app')
