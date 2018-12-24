# Webpack configuration

In `api.chainWebpack` and `api.configureWebpack`, you have access to some environment variables:

- **`process.env.VUE_CLI_SSR_TARGET`**: Either `'client'` or `'server'`

- **`process.env.VUE_CLI_MODE`**: Vue CLI mode

Examples:

```js
api.chainWebpack(config => {
  if (process.env.VUE_CLI_SSR_TARGET === 'client') {
    // Client-only config
  } else {
    // SSR-only config
  }
})
```

```js
api.configureWebpack(config => {
  if (process.env.VUE_CLI_SSR_TARGET === 'client') {
    return {
      // Client-only config
    }
  } else {
    return {
      // SSR-only config
    }
  }
})
```
