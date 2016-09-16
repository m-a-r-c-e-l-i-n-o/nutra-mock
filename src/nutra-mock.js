import fs from 'fs-extra'
import path from 'path'
import inlineSourceMapComment from'inline-source-map-comment'
import sourceModifier from './source-modifier.js'
import genericMock from './generic-mock.js'

const preprocessor = (events, system, opts) => {
    global.NutraMock = genericMock
    events.onLoad = () => {}
    events.onFileLoad = (source, filename, key) => {
        source = sourceModifier(source, filename)
        const sourceMapComment = inlineSourceMapComment(source.map.toString())
        const sourceWithMap = source.code + '\n' + sourceMapComment
        const tmpFilename = path.join(system.tmpDirectory, 'mock', key)

        fs.ensureFileSync(tmpFilename)
        fs.writeFileSync(tmpFilename, sourceWithMap)

        return {
            filename: tmpFilename,
            source: source.code,
            key: key
        }
    }
    events.onExit = () => { }
}

export { preprocessor }
