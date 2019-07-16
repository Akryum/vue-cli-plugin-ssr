# Configuration

Here are the optional settings available in your `vue.config.js` file:

```js
const path = require('path')

module.exports = {
  pluginOptions: {
    ssr: {
      // Listening port for `serve` command
      port: null,
      // Listening host for `serve` command
      host: null,
      // Entry for each target
      entry: target => `./src/entry-${target}`,
      // Default title
      defaultTitle: 'My app',
      // Path to favicon
      favicon: './public/favicon.ico',
      // Skip some requests from being server-side rendered
      skipRequests: req => req.originalUrl === '/graphql',
      // See https://ssr.vuejs.org/guide/build-config.html#externals-caveats
      nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/],
      // Function to connect custom middlewares
      extendServer: app => {
        const cookieParser = require('cookie-parser')
        app.use(cookieParser())
      },
      // Paths
      distPath: path.resolve(__dirname, './dist'),
      error500Html: null,
      templatePath: path.resolve(__dirname, './dist/index.html'),
      serviceWorkerPath: path.resolve(__dirname, './dist/service-worker.js'),
      // Directives fallback
      directives: {
        // See 'Directive' chapter
      }
      lruCacheOptions: {
        // See https://ssr.vuejs.org/guide/caching.html
      },
    }
  }
}
```
