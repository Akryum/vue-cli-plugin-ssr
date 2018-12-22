const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
  host,
}) => {
  return new Promise(async (resolve, reject) => {
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
  })
}
