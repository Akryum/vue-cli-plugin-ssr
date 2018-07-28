import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client'
<%_ if (pwa) { _%>
import './registerServiceWorker'
<%_ } _%>

import { createApp } from './main'

createApp({
  async beforeApp ({
    router
  }) {
    const components = await loadAsyncComponents({ router })
    console.log(components)
  },

  afterApp ({
    app,
    router,
    <%_ if (vuex) { _%>
      store,
    <%_ } _%>
  }) {
    <%_ if (vuex) { _%>
    store.replaceState(window.__INITIAL_STATE__)
    <%_ } _%>
    app.$mount('#app')
  }
})
