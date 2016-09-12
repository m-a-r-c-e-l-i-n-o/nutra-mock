import SourceModifier from './source-modifier.js'
import GenericMock from './generic-mock.js'

const preprocessor = (events, system, opts) => {
    global.NutraMock = GenericMock
    events.onLoad = () => { global.NutraMock = GenericMock }
    events.onFileLoad = (filename, source, key) => {
        return SourceModifier(filename, source, key, system)
    }
    events.onExit = () => { }
}

export { preprocessor }
