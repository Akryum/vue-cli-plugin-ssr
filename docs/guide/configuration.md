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
      // Specify public file paths to disable resource prefetch hints for
      shouldNotPrefetch: [],
      // Specify public file paths to disable resource preload hints for
      shouldNotPreload: [],
      // Entry for each target
      entry: target => `./src/entry-${target}`,
      // Default title
      defaultTitle: 'My app',
      // Path to favicon
      favicon: './public/favicon.ico',
      // Enable Critical CSS
      criticalCSS: true,
      // Skip some requests from being server-side rendered
      skipRequests: req => req.originalUrl === '/graphql',
      // See https://ssr.vuejs.org/guide/build-config.html#externals-caveats
      nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/],
      // Enable node cluster for the production server
      clustered: false,
      // Static files Cache-Control maxAge value
      staticCacheTtl: 1000 * 60 * 60 * 24 * 30,
      // Directives fallback
      directives: {
        // See 'Directive' chapter
      },
      lruCacheOptions: {
        // See https://ssr.vuejs.org/guide/caching.html
      },
      // apply default middleware like compression, serving static files
      applyDefaultServer: true,
      // Function to extend app context object
      extendContext: (req, res, process) => ({ appMode: process.env.APP_MODE }),
      // Function to connect custom middlewares
      extendServer: app => {
        const cookieParser = require('cookie-parser')
        app.use(cookieParser())
      },
      // Copy URL to system clipboard on start
      copyUrlOnStart: true,
      // Function to call after rendering has been completed
      onRender: (res, context) => {
        res.setHeader(`Cache-Control', 'public, max-age=${context.maxAge}`)
      },
      onError: error => {
        // Send to error monitoring service
      },
      // Paths
      distPath: path.resolve(__dirname, './dist'),
      error500Html: path.resolve(__dirname, './dist/500.html'),
      templatePath: path.resolve(__dirname, './dist/index.ssr.html'),
      serviceWorkerPath: path.resolve(__dirname, './dist/service-worker.js'),
    }
  }
}
```
