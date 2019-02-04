# Directives fallback

Let's take the example of a directive which adds red color to a div:

```js
export default {
  inserted(el) {
    el.style.color = 'red'
  }
}
```

```js
Vue.directive('red', red)
```

```html
<div v-red>My red text</div>
```

This directive won't work with SSR. So we need a fallback. 

SSR fallback for our directive (`red-server.js`):

```js
/**
* @param node the VNode where we applied the directive
* @param dir properties of the directive
*/
module.exports = function (node, dir) {
  // get the current style of the node. If it doesn't have one, we create it
  const style = node.data.style || (node.data.style = {})
  // the style can be an array or an object
  if (Array.isArray(style)) {
    //if it's an array, we add a new style in it
    style.push({ color: 'red' })
  } else {
    // else we just set the color to red
    style.color = 'red'
  }
}
```

Then we need to register the directive in `vue.config.js`:

```js
const red = require('red-server')

module.exports = {
  pluginOptions: {
    ssr: {
      directives: {
        red
      }
    }
  }
}
```
