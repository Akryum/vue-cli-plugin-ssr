const fs = require('fs-extra')
const path = require('path')
const {
  hasYarn,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')

module.exports = (api, options, rootOptions) => {
  if (!api.hasPlugin('router')) {
    throw new Error('Please install router plugin with \'vue add router\'.')
  }

  api.extendPackage({
    scripts: {
      'ssr:serve': 'vue-cli-service ssr:serve',
      'ssr:build': 'vue-cli-service ssr:build',
      'ssr:start': 'cross-env NODE_ENV=production vue-cli-service ssr:serve --mode production',
    },
    dependencies: {
      'vue-server-renderer': '^2.6.0',
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
    vuex: api.hasPlugin('vuex'),
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
        contents = contents.replace(/import router from ('|")\.\/router(\.\w+)?('|")/, 'import { createRouter } from $1./router$3')
        contents = contents.replace(/import store from ('|")\.\/store(\.\w+)?('|")/, 'import { createStore } from $1./store$3')
        contents = contents.replace(/import ('|")\.\/registerServiceWorker('|")\n/, '')
        contents = contents.replace(/const apolloProvider = createProvider\(({(.|\s)*?})?\)\n/, '')
        contents = contents.replace(/new Vue\({((.|\s)*)}\)\.\$mount\(.*?\)/, `export async function createApp ({
          beforeApp = () => {},
          afterApp = () => {}
        } = {}) {
          const router = createRouter()
          ${templateOptions.vuex ? 'const store = createStore()' : ''}
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
        contents = contents.replace('apolloProvider: createProvider()', 'apolloProvider')
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }
    }

    // Router
    try {
      const file = getFile(api, './src/router.js')
      if (file) {
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        const { wrapRouterToExportedFunction } = require('./codemod/router')
        contents = wrapRouterToExportedFunction(contents)
        contents = contents.replace(/mode:\s*("|')(hash|abstract)("|'),/, '')
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }
    } catch (e) {
      console.error('An error occured while transforming router code', e.stack)
    }

    // Vuex
    if (api.hasPlugin('vuex')) {
      try {
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
      } catch (e) {
        console.error('An error occured while transforming vuex code', e.stack)
      }
    }

    // Apollo
    if (api.hasPlugin('apollo')) {
      if (fs.existsSync(api.resolve('./apollo-server'))) {
        const file = getFile(api, './apollo-server/server.js')
        let contents
        if (file) {
          contents = fs.readFileSync(file, { encoding: 'utf8' })
        } else {
          contents = `export default app => {
            
          }`
        }

        contents = contents.replace(/export default app => {((.|\s)*)}/, `export default app => {$1
          ssrMiddleware(app, { prodOnly: true })
        }`)
        contents = 'import ssrMiddleware from \'@akryum/vue-cli-plugin-ssr/lib/app\'\n' + contents
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }

      // Replace default apollo dev script
      setTimeout(() => {
        const file = api.resolve('./package.json')
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        contents = contents.replace(/(\s*--run \\?("|')vue-cli-service) serve(\\?("|'))/g, '$1 ssr:serve$3')
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      })
    }

    // Linting
    const execa = require('execa')

    if (api.hasPlugin('apollo')) {
      // Generate JSON schema
      try {
        execa.sync('vue-cli-service', [
          'apollo:schema:generate',
          '--output',
          api.resolve('./node_modules/.temp/graphql/schema'),
        ], {
          preferLocal: true,
        })
      } catch (e) {
        console.error(e)
      }
    }

    // Lint generated/modified files
    try {
      const files = ['*.js', '.*.js', 'src']
      if (api.hasPlugin('apollo')) {
        files.push('apollo-server')
      }
      execa.sync('vue-cli-service', [
        'lint',
        ...files,
      ], {
        preferLocal: true,
      })
    } catch (e) {
      // No ESLint vue-cli plugin
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
  filePath = api.resolve(path.join(file.replace('.js', ''), 'index.js'))
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(path.join(file.replace('.js', ''), 'index.ts'))
  if (fs.existsSync(filePath)) return filePath

  api.exitLog(`File ${file} not found in the project. Automatic generation will be incomplete.`, 'warn')
}
