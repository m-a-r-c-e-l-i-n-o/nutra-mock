import SourceModifier from '../../src/source-modifier.js'

const Source = `
import Path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod } from 'complex'

const Bar = () => {
    Foo()
    const closure = () => {
        complexMethod()
        const closureOfAClosure = () => {
            Complex()
        }
        return closureOfAClosure
    }
    return closure
}

const Foo = () => {
    All.helloWorld()
    TheMethod()
    return Path.join('hello', 'world')
}

export default Bar
export { Foo, Path }
`

const Output = `
import Path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod } from 'complex'

const Bar = () => {
    NutraMock.store["path/to/some/file.js"]["Foo"]()
    const closure = () => {
        NutraMock.store["path/to/some/file.js"]["complexMethod"]()
        const closureOfAClosure = () => {
            NutraMock.store["path/to/some/file.js"]["Complex"]()
        }
        return closureOfAClosure
    }
    return closure
}

const Foo = () => {
    NutraMock.store["path/to/some/file.js"]["All"].helloWorld()
    NutraMock.store["path/to/some/file.js"]["TheMethod"]()
    return NutraMock.store["path/to/some/file.js"]["Path"].join('hello', 'world')
}

export default Bar
export { Foo, Path };
NutraMock.setEntry("path/to/some/file.js", "Foo", Foo);
NutraMock.setEntry("path/to/some/file.js", "Bar", Bar);
NutraMock.setEntry("path/to/some/file.js", "complexMethod", complexMethod);
NutraMock.setEntry("path/to/some/file.js", "TheMethod", TheMethod);
NutraMock.setEntry("path/to/some/file.js", "Complex", Complex);
NutraMock.setEntry("path/to/some/file.js", "All", All);
NutraMock.setEntry("path/to/some/file.js", "Path", Path)
`

describe ('SourceModifier', () => {
    // pressed for time, will write better tests as time allows
    it ('Should do its thing', () => {
        const filename = 'path/to/some/file.js'
        expect(SourceModifier(Source.trim(), filename)).toBe(Output.trim())
    })
})

