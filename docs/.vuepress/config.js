module.exports = {
  dest: 'docs/.vuepress/dist',
  base: '/',
  title: 'Vue CLI SSR plugin',
  description: 'Dead Simple Server-Side-Rendering',
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  evergreen: true,
  displayAllHeaders: true,
  sidebarDepth: 3,
  themeConfig: {
    sidebar: {
      '/guide/': [
        '',
        'configuration',
        'directives',
        'webpack',
      ],
    },
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'Patreon',
        link: 'https://www.patreon.com/akryum',
      },
    ],
  },
  host: '127.0.0.1',
}

