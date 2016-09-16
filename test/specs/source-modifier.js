import fs from 'fs'
import path from 'path'
import sourceModifier from '../../src/source-modifier.js'

const source = `
import path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod, store } from 'complex'

const Bar = () => {
    const path = 'hey'
    Foo()
    const closure = () => {
        complexMethod()
        const closureOfAClosure = () => {
            const Complex = 'hello'
            Complex()
        }
        return closureOfAClosure
    }
    return closure
}

const Foo = () => {
    All.helloWorld()
    TheMethod()
    return path.join('/Complex/hello', 'Complex')
}

const Bar = () => {
    const Two = () => {
        const Foo = 'hello'
        var marcelino = 'braulio'
        let something = Foo
    };
    Foo()
};

const Fuzz = () => {
    Foo()
    const Three = () => {
        Foo()
    }
    const hi = 'man'
}

const Deps = {
    path,
    All
}

const MoreDeps = {
    ...Deps
}

let path = All.path

export default Bar
export { Foo, path }
`

const output = `
import path from 'path';
import * as All from 'everything';
import Complex, {
    someMethod as TheMethod,
    complexMethod,
    store
} from 'complex';
NutraMock.setEntry('path/to/store/file.js', 'path', path);
NutraMock.setEntry('path/to/store/file.js', 'All', All);
NutraMock.setEntry('path/to/store/file.js', 'Complex', Complex);
NutraMock.setEntry('path/to/store/file.js', 'TheMethod', TheMethod);
NutraMock.setEntry('path/to/store/file.js', 'complexMethod', complexMethod);
NutraMock.setEntry('path/to/store/file.js', 'store', store);
const Bar = () => {
    const path = 'hey';
    NutraMock.store['path/to/store/file.js']['Foo'].fake();
    const closure = () => {
        NutraMock.store['path/to/store/file.js']['complexMethod'].fake();
        const closureOfAClosure = () => {
            const Complex = 'hello';
            Complex();
        };
        return closureOfAClosure;
    };
    return closure;
};
NutraMock.setEntry('path/to/store/file.js', 'Bar', Bar);
const Foo = () => {
    NutraMock.store['path/to/store/file.js']['All'].fake.helloWorld();
    NutraMock.store['path/to/store/file.js']['TheMethod'].fake();
    return NutraMock.store['path/to/store/file.js']['path'].fake.join('/Complex/hello', 'Complex');
};
NutraMock.setEntry('path/to/store/file.js', 'Foo', Foo);
const Bar = () => {
    const Two = () => {
        const Foo = 'hello';
        var marcelino = 'braulio';
        let something = Foo;
    };
    NutraMock.store['path/to/store/file.js']['Foo'].fake();
};
NutraMock.setEntry('path/to/store/file.js', 'Bar', Bar);
const Fuzz = () => {
    NutraMock.store['path/to/store/file.js']['Foo'].fake();
    const Three = () => {
        NutraMock.store['path/to/store/file.js']['Foo'].fake();
    };
    const hi = 'man';
};
NutraMock.setEntry('path/to/store/file.js', 'Fuzz', Fuzz);
const Deps = {
    path: NutraMock.store['path/to/store/file.js']['path'].fake,
    All: NutraMock.store['path/to/store/file.js']['All'].fake
};
NutraMock.setEntry('path/to/store/file.js', 'Deps', Deps);
const MoreDeps = { ...Deps };
NutraMock.setEntry('path/to/store/file.js', 'MoreDeps', MoreDeps);
let path = NutraMock.store['path/to/store/file.js']['All'].fake.path;
export default Bar;
export {
    Foo,
    path
};
`

describe ('sourceModifier', () => {
    // pressed for time, will write better tests as time allows
    it ('should do its thing', () => {
        const filename = 'path/to/store/file.js'
        expect(sourceModifier(source.trim(), filename).code).toBe(output.trim())
    })
})
