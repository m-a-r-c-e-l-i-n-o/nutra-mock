import fs from 'fs'
import path from 'path'
import espree from 'espree'
import estraverse from 'estraverse'
import escodegen from 'escodegen'
import inlineSourceMapComment from'inline-source-map-comment'

const espreeConfig = {
    // attach range information to each node
    range: true,
    // attach line/column location information to each node
    loc: true,
    // create a top-level comments array containing all comments
    comment: true,
    // attach comments to the closest relevant node as leadingComments and
    // trailingComments
    attachComment: true,
    // create a top-level tokens array containing all tokens
    tokens: true,
    // specify the language version (3, 5, 6, or 7, default is 5)
    ecmaVersion: 7,
    // specify which type of script you're parsing (script or module, default is script)
    sourceType: 'module',
    // specify additional language features
    ecmaFeatures: {
        // enable JSX parsing
        jsx: true,
        // enable return in global scope
        globalReturn: true,
        // enable implied strict mode (if ecmaVersion >= 5)
        impliedStrict: true,
        // allow experimental object rest/spread
        experimentalObjectRestSpread: true,
        // allow let and const declarations
        blockBindings: true
    }
}

const namespace = '__NUTRA_MOCK__'

const createIdentifier = (id) => {
    const identifier = {
        type: 'Identifier',
        name: id
    }
    identifier[namespace] = true
    return identifier
}

const setEntryMethod = (entry, id) => ({
    type: 'ExpressionStatement',
    expression: {
        type: 'CallExpression',
        callee: createIdentifier('NutraMock.setEntry'),
        arguments: [
            {
                type: 'Literal',
                value: entry,
                raw: `"${entry}"`
            }, {
                type: 'Literal',
                value: id,
                raw: `"${id}"`
            },
            createIdentifier(id)
        ]
    }
})

const mockObject = (entry, id) => ({
    type: 'MemberExpression',
    object: {
        type: 'MemberExpression',
        object: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: createIdentifier('NutraMock'),
                property: createIdentifier('store'),
                computed: false
            },
            property: {
                type: 'Literal',
                value: entry,
                raw: `"${entry}"`
            },
            computed: true
        },
        property: {
            type: 'Literal',
            value: id,
            raw: `"${id}"`
        },
        computed: true
    },
    property: createIdentifier('fake'),
    computed: false
})

const mockObjectExpression = (entry, id) => ({
    type: 'ExpressionStatement',
    expression: mockObject(entry, id)
})

const SourceModifier = (source, filename) => {

    const ast = espree.parse(source, espreeConfig)
    const entry = path.join('.', filename.replace(process.cwd(), ''))
    const topImportNodes = {}
    const topConstantNodes = {}

    // collect relevant nodes in the main execution context
    estraverse.traverse(ast, {
        enter: (node, parent) => {
            if (/FunctionExpression|FunctionDeclaration/.test(node.type)) {
                return estraverse.VisitorOption.Skip
            }
        },
        leave: (node, parent) => {
            if (node[namespace]) {
                return
            }
            if (node.type === 'Identifier' && /Import|Export/.test(parent.type)) {
                if (parent.local && parent.local.name) {
                    parent.local[namespace] = true
                    if (parent.type.startsWith('Import')) {
                        topImportNodes[parent.local.name] = true
                    }
                    if (parent.imported &&
                        parent.imported.name !== parent.local.name) {
                        parent.imported[namespace] = true
                    }
                    if (parent.exported &&
                        parent.exported.name !== parent.local.name) {
                        parent.exported[namespace] = true
                    }
                } else {
                    node[namespace] = true
                }
                return
            }
            if (node.type === 'VariableDeclarator' && parent.kind === 'const') {
                topConstantNodes[node.id.name] = true
                node.id[namespace] = true
            }
        }
    })

    // replace relevant nodes in deep execution contexts
    const topNodes = Object.assign({}, topImportNodes, topConstantNodes)
    estraverse.replace(ast, {
        enter: function(node, parent) {
            if (node.type === 'Identifier' && !node[namespace]) {
                if (!topNodes[node.name]) {
                    return
                }
                if (parent.type === 'ExperimentalSpreadProperty')
                    return
                if (parent.type === 'MemberExpression' && !parent.computed)
                    return
                if (parent.type === 'FunctionDeclaration')
                    return
                if (parent.type === 'VariableDeclarator')
                    return
                if (parent.type === 'Property') {
                    if (parent.shorthand) {
                        parent.shorthand = false
                        parent.value = mockObject(entry, node.name)
                    }
                    return
                }
                return mockObject(entry, node.name)
            }
        }
    })

    // get index of the last import node
    let afterImportNodeIndex = 0
    for (let i = 0; i < ast.body.length; i++) {
        if (!ast.body[i].type.startsWith('Import')) {
            afterImportNodeIndex = i
            break
        }
    }

    // build the import mock registrations
    const importSetEntryMethods = []
    Object.keys(topImportNodes).forEach(
        id => importSetEntryMethods.push(setEntryMethod(entry, id))
    )

    // insert the import mock registrations after the last import node
    let spliceArgs = [afterImportNodeIndex, 0].concat(importSetEntryMethods)
    Array.prototype.splice.apply(ast.body, spliceArgs)

    // insert the constant mock registrations after each constant node
    for (let node, i = (afterImportNodeIndex * 2); i < ast.body.length; i++) {
        node = ast.body[i]
        if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration && typeof node.declaration === 'object') {
                node = node.declaration
            }
        }
        if (node.type !== 'VariableDeclaration' || node.kind !== 'const') {
            continue
        }
        if (node.declarations && typeof node.declarations[0] === 'object') {
            node = node.declarations[0]
        }
        if (node.type === 'VariableDeclarator' && topConstantNodes[node.id.name]) {
            ast.body.splice(++i, 0, setEntryMethod(entry, node.id.name))
        }
    }

    // reconstruct source
    const modifiedSource = escodegen.generate(ast, {
        sourceMap: filename,
        sourceMapWithCode: true
    })

    return {
        code: modifiedSource.code,
        map: modifiedSource.map
    }
}

export default SourceModifier
