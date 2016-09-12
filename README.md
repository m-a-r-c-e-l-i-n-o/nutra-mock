# nutra-mock
The "nutra-mock" module is a mocking library for the "[N.U.T.R.A.](https://github.com/m-a-r-c-e-l-i-n-o/nutra)" unit test runner. Currently, it allows for mocking of all named imports and constants in the main execution context of a valid ES6 module file. It does this by statically analyzing the file with the [es6-global-parser]() module and transforms the relevant globals in the deeper contexts into objects whose properties can changed at any time — essentially allowing you to mock just about anything!

**This is working, but do to time constraits, it's still lacking in the sourcemap department. Expect them to be skewed a bit (not by much, though). Sourcemap generation will be intergrated soon.**

## Installation
```bash
npm install --save-dev nutra nutra-mock
```

## Add Plugin Configuration:
Create a "nutra.config.js" config file in the root of your project and populate it with the following:
```js
// nutra.config.js
module.exports = function( config ) {
  config.set({
    frameworks: ['nutra-jasmine'],
    files: ['specs/**/*.js', 'src/**/*.js'], // Modify to include your own app & spec files
    preprocessors: {
        'src/**/*.js': ['nutra-mock', 'nutra-babel'] // Modify to include your own app files
    }
  })
  // For more configuration options, please take a look at:
  // https://github.com/m-a-r-c-e-l-i-n-o/nutra#configuration-anatomy
}
```

## Usage
In your scripts:
```js
import Path from 'path'

const Foo = () => {
    Path.join('hello', 'world') // This will be made available for mocking
    return Path
}

const Bar = () => Foo // This will also be made available for mocking

export default Foo
export { Bar }
```
In your tests:
```js
import Path from 'path'
import Foo, { Bar } from '../../src/foo.js'

const Mock = NutraMock.getEntry('./src/some-file.js') // Path is relative to cwd

describe ('Foo', () => {
    it ('should initially not mock Foo\'s "Path" dependency', () => {
        expect(Foo()).toBe(Path) // The native "path" module
    })
    it ('should eventually mock Foo\'s "Path" dependency', () => {
        const mockPath = {
            join: (one, two) => {
                expect(one).toBe('hello')
                expect(two).toBe('world')
            }
        }
        Mock.set('Path', mockPath)
        expect(Foo()).toBe(mockPath) // The "mockPath" object
    })
    it ('should inevitably unmock Foo\'s "Path" dependency', () => {
        Mock.reset('Path')
        expect(Foo()).toBe(Path) // The native "path" module
    })
})

describe ('Bar', () => {
    it ('should initially not mock Bar\'s "Foo" dependency', () => {
        expect(Bar()).toBe(Foo) // The original "Foo" method
    })
    it ('should eventually mock Bar\'s "Foo" dependency', () => {
        const mockFoo = () => {}
        Mock.set('Foo', mockFoo)
        expect(Bar()).toBe(mockFoo) // The "mockFoo" method
    })
    it ('should inevitably unmock Bar\'s "Foo" dependency', () => {
        Mock.reset('Foo')
        expect(Bar()).toBe(Foo) // The original "Foo" method
    })
})
```
