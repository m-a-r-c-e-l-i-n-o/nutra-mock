const Mock = {
    store: {},
    setEntry(entryID, id, original) {
        if (!this.store[entryID]) {
            this.store[entryID] = {}
        }
        this.store[entryID][id] = { original, fake: original }
    },
    getEntry(entryID) {
        const entry = this.store[entryID]
        return {
            get: (id) => this.getByID(entry, id),
            set: (id, target) => { this.setMock(entry, id, target) },
            reset: (id) => { this.resetMock(entry, id) }
        }
    },
    getByID(mocks, id) {
        return mocks[id].fake
    },
    setMock(mocks, id, target) {
        mocks[id].fake = target
    },
    resetMock(mocks, id) {
        mocks[id].fake = mocks[id].original
    }
}

export default Mock
