const { types: { namedTypes } } = require('recast')

exports.isVueGlobalCall = (node) => {
  if (namedTypes.ExpressionStatement.check(node)) {
    node = node.expression
    if (namedTypes.CallExpression.check(node)) {
      if (node.callee.object.name === 'Vue') {
        return true
      }
    }
  }
  return false
}
