module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI SSR plugin',
      description: 'Dead Simple Server-Side-Rendering',
    },
  },
  themeConfig: {
    repo: 'Akryum/vue-cli-plugin-ssr',
    docsDir: 'docs',
    editLinks: true,
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        lastUpdated: 'Last Updated',
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
        sidebarDepth: 3,
        sidebar: {
          '/guide/': [
            '',
            'configuration',
            'directives',
          ],
        },
      },
    },
  },
}
