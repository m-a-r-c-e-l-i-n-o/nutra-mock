import ES6GlobalParser from 'es6-global-parser'
import EscapeStringRegexp from 'escape-string-regexp'

const ReplaceAt = (original, replacement, start, end) => {
    return original.slice(0, start) + replacement + original.slice(end)
}

const SourceModifier = (source, filename, key, system) => {
    // console.log('Second!')
    const shortFileName = '.' + filename.replace(process.cwd(), '')
    const invocations = []
    const substitutions = []
    const suffixID = '__NUTRA_MOCK__'
    const originalsource = source

    // Get all the global names that would need to be mocked
    const globals = ES6GlobalParser(source)

    // Go through all the names to in reverse as to not distort the positions of
    // the static replacements
    globals.reverse().forEach(({ type, name, start, end }) => {
        // Add suffix to all global names to make it easier to do a global
        // replacement of all relevant names in the deep execution contexts
        source = ReplaceAt(source, name + suffixID, start, end)
        // While we are at it
        if (type !== 'export') {
            // Create all the invocations that will set the original values for
            // all the global names in the file
            invocations.push(
                `NutraMock.setEntry("${shortFileName}", "${name}", ${name})`
            )
            // Create all the substitutions that will deliver the correct values
            // whenever these global names are requested
            substitutions.push({
                name,
                alias: `NutraMock.store["${shortFileName}"]["${name}"].fake`
            })
        }
    })

    // Replace all deep execution contexts names with their substitutes
    substitutions.forEach(({ name, alias }) => {
        const escapedRegex = EscapeStringRegexp(name)
        const pattern = new RegExp(`\\b${name}\\b`, 'g')
        source = source.replace(pattern, alias)
    })

    // Restore all global names to their original value
    const pattern = new RegExp(`${suffixID}`, 'g')
    source = source.replace(pattern, '')

    // Inject the invocations that will set the original values
    source = source + ';\n' + invocations.join(';\n')

    return source
}

export default SourceModifier
