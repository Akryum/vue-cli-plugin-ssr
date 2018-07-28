const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
}) => {
  return new Promise((resolve, reject) => {
    const app = express()

    applyApp(app)

    app.listen(port, err => {
      if (err) {
        reject(err)
      } else {
        console.log(`Server listening on ${port}`)
        resolve({ app, port })
      }
    })
  })
}
