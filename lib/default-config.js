module.exports = (api, options) => {
  const outputPath = options.outputPath || './dist'

  return {
    distPath: api.resolve(outputPath),
    templatePath: api.resolve('./src/index.template.html'),
    serviceWorkerPath: api.resolve(`${outputPath}/service-worker.js`),
  }
}
