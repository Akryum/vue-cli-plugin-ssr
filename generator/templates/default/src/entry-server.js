<%_ if (apollo) { _%>
import 'isomorphic-fetch'
import Vue from 'vue'
import App from './App.vue'
import ApolloSSR from 'vue-apollo/ssr'
<%_ } _%>
import { createApp } from './main'

<%_ if (apollo) { _%>
Vue.use(ApolloSSR)

<%_ } _%>
export default context => {
  return new Promise(async (resolve, reject) => {
    const {
      app,
      router,
<%_ if (vuex) { _%>
      store,
<%_ } _%>
<%_ if (apollo) { _%>
      apolloProvider
<%_ } _%>
    } = await createApp()

    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      Promise.all([
<%_ if (vuex) { _%>
        // Async data
        ...matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({
              store,
              route: router.currentRoute,
            })
          }
        }),
<%_ } _%>
<%_ if (apollo) { _%>
        // Apollo prefetch
        ApolloSSR.prefetchAll(apolloProvider, [App, ...matchedComponents], {
<%_ if (vuex) { _%>
          store,
<%_ } _%>
          route: router.currentRoute,
        }),
<%_ } _%>
      ]).then(() => {
<%_ if (vuex) { _%>
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        context.state = store.state
<%_ } _%>

<%_ if (apollo) { _%>
        // Same for Apollo client cache
        context.apolloState = ApolloSSR.getStates(apolloProvider)
<%_ } _%>
        resolve(app)
      })
    }, reject)
  })
}
