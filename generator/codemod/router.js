const { parse, types: { namedTypes, builders }, print } = require('recast')
const { isVueGlobalCall } = require('./util')

exports.wrapRouterToExportedFunction = (contents) => {
  // @TODO remove when esprima supports dynamic imports
  contents = contents.replace(/import\(/g, '__webpack_dynamic_import__(')
  const ast = parse(contents)

  const outside = []
  const inside = []
  let origDefaultExportDeclaration

  ast.program.body.forEach(node => {
    if (namedTypes.ExportDefaultDeclaration.check(node)) {
      origDefaultExportDeclaration = node
    } else if (
      namedTypes.ImportDeclaration.check(node) ||
      namedTypes.ExportAllDeclaration.check(node) ||
      namedTypes.ExportNamedDeclaration.check(node) ||
      namedTypes.ExportDeclaration.check(node) ||
      isVueGlobalCall(node)
    ) {
      outside.push(node)
    } else {
      inside.push(node)
    }
  })

  const returnStatement = builders.returnStatement(
    origDefaultExportDeclaration.declaration,
  )

  const functionDeclaration = builders.functionDeclaration(
    builders.identifier('createRouter'),
    [],
    builders.blockStatement([
      ...inside,
      returnStatement,
    ]),
  )

  const newProgram = builders.program([
    ...outside,
    builders.exportNamedDeclaration(
      functionDeclaration,
    ),
  ])

  contents = print(newProgram).code

  // @TODO remove when esprima supports dynamic imports
  contents = contents.replace(/__webpack_dynamic_import__\(/g, 'import(')
  return contents
}
