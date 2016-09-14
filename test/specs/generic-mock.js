import GenericMock from '../../src/generic-mock.js'

describe ('GenericMock.store', () => {
    it ('should return an empty store', () => {
        expect(GenericMock.store).toEqual({})
    })
})

describe ('GenericMock.setEntry', () => {
    it ('should register the entries', () => {
        const mockEntryID = 'mockEntryID'
        const mockID1 = 'mockID1'
        const mockID2 = 'mockID2'
        const original1 = 'original1'
        const original2 = 'original2'
        const result = {}
        result[mockEntryID] = {}
        result[mockEntryID][mockID1] = { original: original1, fake: original1 }
        result[mockEntryID][mockID2] = { original: original2, fake: original2 }
        GenericMock.store = {}
        GenericMock.setEntry(mockEntryID, mockID1, original1)
        GenericMock.setEntry(mockEntryID, mockID2, original2)
        expect(GenericMock.store).toEqual(result)
    })
})

describe ('GenericMock.getEntry', () => {
    it ('should return operational methods', () => {
        GenericMock.store = {}
        expect(GenericMock.getEntry(null)).toEqual({
            get: jasmine.any(Function),
            set: jasmine.any(Function),
            reset: jasmine.any(Function)
        })
    })
})

describe ('GenericMock.getEntry\'s set method', () => {
    it ('should call the setMock method', () => {
        const mockEntryID = 'mockEntryID'
        const mockEntry = 'mockEntry'
        const mockID = 'mockID'
        const mockTarget = 'mockTarget'
        const originalSetMock = GenericMock.setMock
        GenericMock.setMock = jasmine.createSpy('setMock')
        GenericMock.store = {}
        GenericMock.store[mockEntryID] = mockEntry
        const setMethod = GenericMock.getEntry(mockEntryID).set
        setMethod(mockID, mockTarget)
        expect(GenericMock.setMock).toHaveBeenCalledTimes(1)
        expect(GenericMock.setMock).toHaveBeenCalledWith(mockEntry, mockID, mockTarget)
        GenericMock.setMock = originalSetMock
    })
})

describe ('GenericMock.getEntry\'s reset method', () => {
    it ('should call the resetMock method', () => {
        const mockEntryID = 'mockEntryID'
        const mockEntry = 'mockEntry'
        const mockID = 'mockID'
        const originalResetMock = GenericMock.resetMock
        GenericMock.resetMock = jasmine.createSpy('resetMock')
        GenericMock.store = {}
        GenericMock.store[mockEntryID] = mockEntry
        const resetMethod = GenericMock.getEntry(mockEntryID).reset
        resetMethod(mockID)
        expect(GenericMock.resetMock).toHaveBeenCalledTimes(1)
        expect(GenericMock.resetMock).toHaveBeenCalledWith(mockEntry, mockID)
        GenericMock.resetMock = originalResetMock
    })
})

describe ('GenericMock.getEntry\'s get method', () => {
    it ('should call the getByID method', () => {
        const mockEntryID = 'mockEntryID'
        const mockEntry = 'mockEntry'
        const mockID = 'mockID'
        const originalGetByID = GenericMock.getByID
        GenericMock.getByID = jasmine.createSpy('getByID')
        GenericMock.store = {}
        GenericMock.store[mockEntryID] = mockEntry
        const getMethod = GenericMock.getEntry(mockEntryID).get
        getMethod(mockID)
        expect(GenericMock.getByID).toHaveBeenCalledTimes(1)
        expect(GenericMock.getByID).toHaveBeenCalledWith(mockEntry, mockID)
        GenericMock.getByID = originalGetByID
    })
})

describe ('GenericMock.getByID method', () => {
    it ('should return the fake value', () => {
        const fake = 'fakeValue'
        const original = 'originalValue'
        const mockID = 'mockID'
        const mocks = {}
        mocks[mockID] = { original, fake }
        expect(GenericMock.getByID(mocks, mockID)).toBe(fake)
    })
})

describe ('GenericMock.setMock method', () => {
    it ('should assign a target value to the fake property', () => {
        const fake = 'fakeValue'
        const original = 'originalValue'
        const mockID = 'mockID'
        const mockTarget = 'mockTarget'
        const mocks = {}
        mocks[mockID] = { original, fake }
        GenericMock.setMock(mocks, mockID, mockTarget)
        expect(mocks[mockID].fake).toBe(mockTarget)
        expect(mocks[mockID].original).toBe(original)
    })
})

describe ('GenericMock.resetMock method', () => {
    it ('should assign the original value to the fake property', () => {
        const fake = 'fakeValue'
        const original = 'originalValue'
        const mockID = 'mockID'
        const mocks = {}
        mocks[mockID] = { original, fake }
        GenericMock.resetMock(mocks, mockID)
        expect(mocks[mockID].fake).toBe(original)
        expect(mocks[mockID].original).toBe(original)
    })
})
