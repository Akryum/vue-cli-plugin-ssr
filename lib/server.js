const cluster = require('cluster')
const express = require('express')
const applyApp = require('./app')
const config = require('./config')

exports.createServer = ({
  port,
  host,
}) => {
  return new Promise(async (resolve, reject) => {
    const isProd = process.env.NODE_ENV === 'production'
    console.log('server started!!!!')

    if (cluster.isMaster && isProd && config.cluster) {
      let cpus = require('os').cpus().length
      for (let i = 0; i < cpus; i += 1) {
        cluster.fork()
      }
    } else {
      const app = express()

      await applyApp(app)

      app.listen(port, host, err => {
        if (err) {
          reject(err)
        } else {
          console.log(`Server listening on ${host}:${port}`)
          resolve({ app, port })
        }
      })
    }
  })
}
