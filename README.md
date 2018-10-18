# @akryum/vue-cli-plugin-ssr

[![npm](https://img.shields.io/npm/v/@akryum%2Fvue-cli-plugin-ssr.svg) ![npm](https://img.shields.io/npm/dm/@akryum%2Fvue-cli-plugin-ssr.svg)](https://www.npmjs.com/package/@akryum%2Fvue-cli-plugin-ssr)
[![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)

Simple Server-Side-Rendering plugin for Vue CLI (Work-in-Progress)

<p>
  <a href="https://www.patreon.com/akryum" target="_blank">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
  </a>
</p>

## Sponsors

### Silver

<p align="center">
  <a href="https://vueschool.io/" target="_blank">
    <img src="https://vueschool.io/img/logo/vueschool_logo_multicolor.svg" alt="VueSchool logo" width="200px">
  </a>
</p>

<br>

**:star: Features:**

- Automatic conversion of your project to SSR
- Integrated express server
- Vuex store
- Async routes
- [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) support
- Custom middlewares

<br>

**:rocket: Roadmap:**

- Automatic conversion of vuex modules to `state () {}`
- Integration with CLI UI

## Usage

```bash
vue add @akryum/ssr
yarn run ssr:serve
```

To run the app in production:

```bash
yarn run ssr:build
yarn run ssr:start
```

## Configuration

Here are the optional settings available in your `vue.config.js` file:

```js
const path = require('path')

module.exports = {
  pluginOptions: {
    ssr: {
      // Listening port for `serve` command
      port: null,
      // Listening host for `serve` command
      host: null,
      // Entry for each target
      entry: target => `./src/entry-${target}`,
      // Default title
      defaultTitle: 'My app',
      // Path to favicon
      favicon: './public/favicon.ico',
      // Skip some requests from being server-side rendered
      skipRequests: req => req.originalUrl === '/graphql',
      // See https://ssr.vuejs.org/guide/build-config.html#externals-caveats
      nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/],
      // Function to connect custom middlewares
      extendServer: app => {
        const cookieParser = require('cookie-parser')
        app.use(cookieParser())
      },
      // Paths
      distPath: path.resolve(__dirname, './dist'),
      templatePath: path.resolve(__dirname, './dist/index.html'),
      serviceWorkerPath: path.resolve(__dirname, './dist/service-worker.js'),
    }
  }
}
```
