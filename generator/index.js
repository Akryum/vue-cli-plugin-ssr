const fs = require('fs-extra')
const {
  hasYarn,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')

module.exports = (api, options, rootOptions) => {
  // TODO cleanup for next cli release
  if (!api.hasPlugin('router') && !api.generator.pkg.dependencies['vue-router']) {
    throw new Error(`Please install router plugin with 'vue add router'.`)
  }

  api.extendPackage({
    scripts: {
      'ssr:serve': 'vue-cli-service ssr:serve',
      'ssr:build': 'vue-cli-service ssr:build',
      'ssr:start': 'cross-env NODE_ENV=production vue-cli-service ssr:serve --mode production',
    },
    dependencies: {
      'vue-server-renderer': '^2.5.16',
    },
  })

  if (api.hasPlugin('apollo')) {
    api.extendPackage({
      dependencies: {
        'isomorphic-fetch': '^2.2.1',
      },
    })
  }

  const templateOptions = {
    // TODO cleanup for next cli release
    vuex: api.hasPlugin('vuex') || api.generator.pkg.dependencies['vuex'],
    pwa: api.hasPlugin('pwa'),
    apollo: api.hasPlugin('apollo'),
  }

  api.render('./templates/default', templateOptions)

  api.onCreateComplete(() => {
    // Main
    {
      const file = getFile(api, './src/main.js')
      if (file) {
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        contents = contents.replace(`import router from './router'`, `import { createRouter } from './router'`)
        contents = contents.replace(`import store from './store'`, `import { createStore } from './store'`)
        contents = contents.replace(`import './registerServiceWorker'\n`, ``)
        contents = contents.replace(/const apolloProvider = createProvider\(({(.|\s)*?})?\)\n/, ``)
        contents = contents.replace(/new Vue\({((.|\s)*)}\)\.\$mount\(.*?\)/, `export async function createApp ({
          context,
          beforeApp = () => {},
          afterApp = () => {}
        } = {}) {
          const router = createRouter()
          ${templateOptions.vuex ? `const store = createStore()` : ''}
          ${templateOptions.apollo ? `const apolloProvider = createProvider({
            ssr: process.server,
          })` : ''}

          await beforeApp({
            router,
            ${templateOptions.vuex ? 'store,' : ''}
            ${templateOptions.apollo ? 'apolloProvider,' : ''}
          })

          const app = new Vue({$1})

          const result = {
            app,
            router,
            ${templateOptions.vuex ? 'store,' : ''}
            ${templateOptions.apollo ? 'apolloProvider,' : ''}
          }

          await afterApp(result)

          return result
        }`)
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }
    }

    // Router
    {
      const file = getFile(api, './src/router.js')
      if (file) {
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        contents = contents.replace(/export default new Router\({((.|\s)+)}\)/, `export function createRouter () {
          return new Router({
            ${contents.includes('mode:') ? '' : `mode: 'history',`}$1})
        }`)
        contents = contents.replace(/mode:\s*("|')(hash|abstract)("|'),/, '')
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }
    }

    // Vuex
    if (api.hasPlugin('vuex')) {
      const file = getFile(api, './src/store.js')
      if (file) {
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        contents = contents.replace(/export default new Vuex\.Store\({((.|\s)+)}\)/, `export function createStore () {
          return new Vuex.Store({$1})
        }`)
        contents = contents.replace(/state:\s*{((.|\s)*?)},\s*(getters|mutations|actions|modules|namespaced):/, `state () {
          return {$1}
        },
        $3:`)
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }
    }

    // Linting
    if (api.hasPlugin('eslint')) {
      // Lint generated/modified files
      try {
        const lint = require('@vue/cli-plugin-eslint/lint')
        lint({ silent: true }, api)
      } catch (e) {
        // No ESLint vue-cli plugin
      }
    }

    api.exitLog(`Start dev server with ${chalk.cyan(`${hasYarn() ? 'yarn' : 'npm'} run ssr:serve`)}`, 'info')
    api.exitLog(`Build with ${chalk.cyan(`${hasYarn() ? 'yarn' : 'npm'} run ssr:build`)}`, 'info')
    api.exitLog(`Run in production with ${chalk.cyan(`${hasYarn() ? 'yarn' : 'npm'} run ssr:start`)}`, 'info')
  })
}

function getFile (api, file) {
  let filePath = api.resolve(file)
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(file.replace('.js', '.ts'))
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(file.replace('.js', ''), 'index.js')
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(file.replace('.js', ''), 'index.ts')
  if (fs.existsSync(filePath)) return filePath

  api.exitLog(`File ${file} not found in the project. Automatic generation will be incomplete.`, 'warn')
}
