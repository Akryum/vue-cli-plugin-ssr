<%_ if (apollo) { _%>
import 'isomorphic-fetch'
<%_ } _%>
import { createApp } from './main'

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

      if (!matchedComponents.length) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject({ code: 404 })
      }

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
        apolloProvider.prefetchAll({
          route: router.currentRoute,
        }, matchedComponents),
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
        // Apollo
        context.apolloState = apolloProvider.getStates()
<%_ } _%>
      })

      resolve(app)
    }, reject)
  })
}
