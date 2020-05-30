const config = require('./lib/config')
const defaultConfig = require('./lib/default-config')

module.exports = (api, options) => {
  // Config
  Object.assign(config, defaultConfig(api, options), options.pluginOptions && options.pluginOptions.ssr)

  config.api = api
  const service = config.service = api.service

  api.chainWebpack(webpackConfig => {
    // Default entry
    if (!process.env.VUE_CLI_SSR_TARGET) {
      webpackConfig.entry('app').clear().add(config.entry('client'))
    } else {
      const { chainWebpack } = require('./lib/webpack')
      chainWebpack(webpackConfig)
    }
  })

  api.registerCommand('ssr:build', {
    description: 'build for production (SSR)',
  }, async (args) => {
    const rimraf = require('rimraf')
    rimraf.sync(api.resolve(config.distPath))

    const { getWebpackConfigs } = require('./lib/webpack')
    const [clientConfigLegacy, clientConfigModern, serverConfig] = getWebpackConfigs(service)

    const compile = ({ webpackConfigs, watch, service }) => {
      Object.keys(require.cache)
        .filter(key => key.includes('@vue/cli-plugin-babel'))
        .forEach(key => delete require.cache[key])

      const webpack = require('webpack')
      const formatStats = require('@vue/cli-service/lib/commands/build/formatStats')

      const options = service.projectOptions

      const compiler = webpack(webpackConfigs)
      return new Promise((resolve) => {
        const onCompilationComplete = (err, stats) => {
          if (err) {
            // eslint-disable-next-line
            console.error(err.stack || err)
            if (err.details) {
              // eslint-disable-next-line
              console.error(err.details)
            }
            return resolve()
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
          resolve()
        }

        if (watch) {
          compiler.watch({}, onCompilationComplete)
        } else {
          compiler.run(onCompilationComplete)
        }
      })
    }

    process.env.VUE_CLI_MODERN_MODE = true
    await compile({ webpackConfigs: [clientConfigLegacy, serverConfig], watch: args.watch, service })
    process.env.VUE_CLI_MODERN_BUILD = true
    // Modern build depends on files from legacy build, that's why these
    // compilations cannot run parallely
    await compile({ webpackConfigs: [clientConfigModern], watch: args.watch, service })
  })

  api.registerCommand('ssr:serve', {
    description: 'Run the included server.',
    usage: 'vue-cli-service ssr:serve [options]',
    options: {
      '-p, --port [port]': 'specify port',
      '-h, --host [host]': 'specify host',
    },
  }, async (args) => {
    const { createServer } = require('./lib/server')

    let port = args.port || config.port || process.env.PORT
    if (!port) {
      const portfinder = require('portfinder')
      port = await portfinder.getPortPromise()
    }

    const host = args.host || config.host || process.env.HOST || 'localhost'

    config.port = port
    config.host = host

    return createServer({
      port,
      host,
    })
  })
}

module.exports.defaultModes = {
  'ssr:build': 'production',
  'ssr:serve': 'development',
}
