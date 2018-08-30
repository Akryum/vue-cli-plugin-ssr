module.exports = api => {
  api.describeTask({
    match: /vue-cli-service ssr:serve/,
    description: `Compiles and hot-reloads for development with SSR`,
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
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
  })

  api.describeTask({
    match: /vue-cli-service ssr:build/,
    description: `Compiles and minifies for production with SSR`,
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
  })

  api.describeTask({
    match: /vue-cli-service ssr:start/,
    description: `Starts the included HTTP server for SSR in production`,
    link: 'https://github.com/Akryum/vue-cli-plugin-ssr#usage',
  })
}
