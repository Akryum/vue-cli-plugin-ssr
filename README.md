# @akryum/vue-cli-plugin-ssr

[![npm](https://img.shields.io/npm/v/@akryum%2Fvue-cli-plugin-ssr.svg) ![npm](https://img.shields.io/npm/dm/@akryum%2Fvue-cli-plugin-ssr.svg)](https://www.npmjs.com/package/@akryum%2Fvue-cli-plugin-ssr)
[![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)

Simple Server-Side-Rendering plugin for Vue CLI (Work-in-Progress)

<p>
  <a href="https://www.patreon.com/akryum" target="_blank">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
  </a>
</p>

<br>

**:star: Features:**

- Automatic conversion of your project to SSR
- Integrated express server
- Vuex store
- Async routes
- [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) support

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
