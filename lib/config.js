module.exports = {
  api: null,
  service: null,
  port: null,
  host: null,
  entry: target => `./src/entry-${target}`,
  defaultTitle: 'My app',
  favicon: './public/favicon.ico',
  skipRequests: req => req.originalUrl === '/graphql',
  nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/],
  extendServer: null,
  staticCacheTtl: 1000 * 60 * 60 * 24 * 30,
  // Paths
  distPath: null,
  error500Html: null,
  templatePath: null,
  serviceWorkerPath: null,
  directives: {},
}
