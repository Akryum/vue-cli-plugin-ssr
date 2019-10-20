const cluster = require('cluster')
const express = require('express')
const applyApp = require('./app')
const config = require('./config')

exports.createServer = ({
  port,
  host,
}) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const clustered = process.env.NODE_ENV === 'production' && config.clustered

    // If the clustering mode is enabled and we are in the master process, create one worker per CPU core
    if (cluster.isMaster && clustered) {
      const cpus = require('os').cpus().length
      console.log(`[${new Date().toTimeString().split(' ')[0]}] Setting up clusters for ${cpus} cores`)
      for (let i = 0; i < cpus; i += 1) {
        cluster.fork()
      }

      // Notify if new worker is created
      cluster.on('online', (worker) => {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] Worker ${worker.id} is online and listening on ${host}:${port}`)
      })

      // If a worker dies, create a new one to keep the performance steady
      cluster.on('exit', (worker, code, signal) => {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] Worker ${worker.id} exited with code/signal ${code || signal}, respawning...`)
        cluster.fork()
      })

      // If the clustering mode is disabled or we are in a worker process, setup the server
    } else {
      const app = express()

      await applyApp(app)

      app.listen(port, host, err => {
        if (err) {
          reject(err)
        } else {
          if (!clustered) {
            console.log(`[${new Date().toTimeString().split(' ')[0]}] Server listening on ${host}:${port}`)
          }
          resolve({ app, port })
        }
      })
    }
  })
}
