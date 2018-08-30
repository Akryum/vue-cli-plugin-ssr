module.exports = (api, options) => {
  const outputPath = options.outputPath || './dist'

  return {
    distPath: api.resolve(outputPath),
    templatePath: api.resolve(`${outputPath}/index.html`),
    serviceWorkerPath: api.resolve(`${outputPath}/service-worker.js`),
  }
}
