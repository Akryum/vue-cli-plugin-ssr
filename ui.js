module.exports = api => {
  const taskCommon = {
    prompts: [
      {
        name: 'port',
        type: 'input',
        default: '',
        description: 'Specify port',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.port) args.push('--port', answers.port)
    },
  }

  api.describeTask({
    match: /vue-cli-service ssr:serve --mode production/,
    description: 'Starts the included HTTP server for SSR in production',
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
    ...taskCommon,
  })

  api.describeTask({
    match: /vue-cli-service ssr:serve/,
    description: 'Compiles and hot-reloads for development with SSR',
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
    ...taskCommon,
  })

  api.describeTask({
    match: /vue-cli-service ssr:build/,
    description: 'Compiles and minifies for production with SSR',
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
  })
}
