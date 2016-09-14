import ES6GlobalParser from './es6-global-parser'
import EscapeStringRegexp from 'escape-string-regexp'

const ReplaceAt = (original, replacement, start, end) => {
    return original.slice(0, start) + replacement + original.slice(end)
}

const GenerateEntrySetter = (entry, name) => {
    return `NutraMock.setEntry("${entry}", "${name}", ${name})`
}

const SourceModifier = (source, filename, key, system) => {

    // Get all the global names that would need to be mocked
    const globals = ES6GlobalParser(source)
    const entry = '.' + filename.replace(process.cwd(), '')
    const suffixID = '__NUTRA_MOCK__'
    const { imports, exports, constants } = globals
    const substitutions = []

    exports.nodes.forEach(({ name, start, end }) => {
        substitutions.push({ value: name + suffixID, start, end})
    })
    constants.nodes.forEach(({ name, start, end, terminal }) => {
        const value = ';' + GenerateEntrySetter(entry, name + suffixID) + ';'
        substitutions.push({ value, start: terminal, end: terminal})
    })

    substitutions
    .sort((a, b) => b.start - a.start )
    .forEach(({ value, start, end }) => {
        source = ReplaceAt(source, value, start, end)
    })

    let bodySource = source.slice(imports.end || 0)

    // Replace all deep execution contexts names with their substitutes
    imports.nodes.concat(constants.nodes).forEach(({ name, alias }) => {
        const escapedRegex = EscapeStringRegexp(name)
        const patternOne = new RegExp(`(const|var|let|\\.|\\/)(\\s*${escapedRegex})|(\\'|\\"|\\\`)(${escapedRegex})(\\'|\\"|\\\`)`, 'g')
        bodySource = bodySource.replace(patternOne, `$1$2$3$4${suffixID}$5`)
        const patternTwo = new RegExp(`\\b${name}\\b`, 'g')
        const equivalent = `NutraMock.store["${entry}"]["${name}${suffixID}"].fake`
        bodySource = bodySource.replace(patternTwo, equivalent)
    })

    // Restore all global names to their original value
    const pattern = new RegExp(`${suffixID}`, 'g')
    bodySource = bodySource.replace(pattern, '')

    const importEntries = '\n;' + imports.nodes.map(({ name }) => {
        return GenerateEntrySetter(entry, name)
    }).join('\n;') + ';'

    const importSection = source.slice(imports.start || 0, imports.end || 0)
    source = importSection + importEntries + bodySource
    return source
}

export default SourceModifier
