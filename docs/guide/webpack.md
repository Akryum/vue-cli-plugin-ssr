# Webpack configuration

In the `chainWebpack()` and `configureWebpack()` options in `vue.config.js`, you have access to some environment 
variables:

- **`process.env.VUE_CLI_SSR_TARGET`**: Either `'client'` or `'server'`

- **`process.env.VUE_CLI_MODE`**: Vue CLI mode

`vue.config.js`'s `chainWebpack()` option:

```js
module.exports = {
  // ...
  chainWebpack(config => {
    if (process.env.VUE_CLI_SSR_TARGET === 'client') {
      // Client-only config
    } else {
      // SSR-only config
    }
  }),
  // ...
}
```

`vue.config.js`'s `configureWebpack()` option:

```js
module.exports = {
  // ...
  configureWebpack(config => {
    if (process.env.VUE_CLI_SSR_TARGET === 'client') {
      return {
        // Client-only config
      }
    } else {
      return {
        // SSR-only config
      }
    }
  }),
  // ...
}
```
