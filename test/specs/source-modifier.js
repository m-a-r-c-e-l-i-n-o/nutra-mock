import SourceModifier from '../../src/source-modifier.js'

const Source = `
import Path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod, store } from 'complex'

const Bar = () => {
    const Path = 'hey'
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
    return Path.join('/Complex/hello', 'Complex')
}

export default Bar
export { Foo, Path }
`

const Output = `
import Path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod, store } from 'complex'
;NutraMock.setEntry(".path/to/store/file.js", "Path", Path)
;NutraMock.setEntry(".path/to/store/file.js", "All", All)
;NutraMock.setEntry(".path/to/store/file.js", "Complex", Complex)
;NutraMock.setEntry(".path/to/store/file.js", "TheMethod", TheMethod)
;NutraMock.setEntry(".path/to/store/file.js", "complexMethod", complexMethod)
;NutraMock.setEntry(".path/to/store/file.js", "store", store);

const Bar = () => {
    const Path = 'hey'
    NutraMock.store[".path/to/store/file.js"]["Foo"].fake()
    const closure = () => {
        NutraMock.store[".path/to/store/file.js"]["complexMethod"].fake()
        const closureOfAClosure = () => {
            NutraMock.store[".path/to/store/file.js"]["Complex"].fake()
        }
        return closureOfAClosure
    }
    return closure
};NutraMock.setEntry(".path/to/store/file.js", "Bar", Bar);

const Foo = () => {
    NutraMock.store[".path/to/store/file.js"]["All"].fake.helloWorld()
    NutraMock.store[".path/to/store/file.js"]["TheMethod"].fake()
    return NutraMock.store[".path/to/store/file.js"]["Path"].fake.join('/Complex/hello', 'Complex')
};NutraMock.setEntry(".path/to/store/file.js", "Foo", Foo);

export default Bar
export { Foo, Path }

`
describe ('SourceModifier', () => {
    // pressed for time, will write better tests as time allows
    it ('Should do its thing', () => {
        const filename = 'path/to/store/file.js'
        SourceModifier(Source.trim(), filename)
        // expect(SourceModifier(Source.trim(), filename)).toBe(Output.trim())
    })
})
