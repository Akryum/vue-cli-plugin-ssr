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
      // Static files Cache-Control maxAge value
      staticCacheTtl: 1000 * 60 * 60 * 24 * 30,
      // Directives fallback
      directives: {
        // See 'Directive' chapter
      },
      lruCacheOptions: {
        // See https://ssr.vuejs.org/guide/caching.html
      },
      // Function to connect custom middlewares
      extendServer: app => {
        const cookieParser = require('cookie-parser')
        app.use(cookieParser())
      },
      // Function to call after rendering has been completed
      onRender: (res, context) => {
        res.setHeader(`Cache-Control', 'public, max-age=${context.maxAge}`)
      },
      onError: error => {
        // Send to error monitoring service
      },
      // Paths
      distPath: path.resolve(__dirname, './dist'),
      error500Html: null,
      templatePath: path.resolve(__dirname, './dist/index.html'),
      serviceWorkerPath: path.resolve(__dirname, './dist/service-worker.js'),
    }
  }
}
```
