module.exports = {
  api: null,
  service: null,
  port: null,
  entry: target => `./src/entry-${target}`,
  defaultTitle: 'My app',
  favicon: './public/favicon.ico',
  skipRequests: req => req.originalUrl === '/graphql',
  // Paths
  distPath: null,
  templatePath: null,
  serviceWorkerPath: null,
}
