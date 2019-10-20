<%_ if (apollo) { _%>
import 'isomorphic-fetch'
import ApolloSSR from 'vue-apollo/ssr'
<%_ } _%>
import { createApp } from './main'

const prepareUrlForRouting = url => {
  const { BASE_URL } = process.env
  return url.startsWith(BASE_URL.replace(/\/$/, ''))
    ? url.substr(BASE_URL.length)
    : url
}

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

    router.push(prepareUrlForRouting(context.url))

    router.onReady(() => {
      context.rendered = () => {
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
      }
      resolve(app)
    }, reject)
  })
}
