import Emithor from '../src'

const CALLBACK_1 = jest.fn((a, b) => a + b)
const CALLBACK_2 = jest.fn((str1, str2) => `${str1} ${str2}`)
const CALLBACK_3 = jest.fn((a, b) => a - b)
const CALLBACK_ERROR = jest.fn(() => {
  throw new Error('new error')
})

const EVENT_NAME_1 = 'event1'
const EVENT_NAME_1_NAMESPACED_LVL_2 = 'event1.event2'
const EVENT_NAME_1_NAMESPACED_LVL_3 = 'event1.event2.event3'
const EVENT_NAME_2 = 'event2'
const EVENT_NAME_EMPTY_EVENT = 'event3'

describe('Emithor', () => {
  afterEach(() => {
    CALLBACK_1.mockClear()
    CALLBACK_2.mockClear()
  })

  describe('on method', () => {
    it('should register events and callbacks', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1_NAMESPACED_LVL_2, CALLBACK_1)
      em.on(EVENT_NAME_1_NAMESPACED_LVL_3, CALLBACK_1)

      expect(em.getEvents()).toMatchSnapshot()
    })

    it('should register multiple callbacks on same event', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1, CALLBACK_2)

      expect(em.getEvents()).toMatchSnapshot()
    })

    it('should not register callback if that callback already exist', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1, CALLBACK_2)
      em.on(EVENT_NAME_2, CALLBACK_1)
      em.on(EVENT_NAME_2, CALLBACK_2)
      em.on(EVENT_NAME_2, CALLBACK_2)

      expect(em.getEvents()).toMatchSnapshot()
    })

    it('should not create event and register callbacks if params are missing', () => {
      const em = new Emithor()

      em.on(null, null)
      em.on(undefined, undefined)
      em.on(EVENT_NAME_1, null)
      em.on('', CALLBACK_1)

      expect(em.getEvents()).toEqual([])
    })
  })

  describe('trigger method', () => {
    it('should trigger callback and pass params', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.trigger(EVENT_NAME_1, null, 1, 2)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(CALLBACK_1.mock.calls[0][0]).toBe(1) // test first param
      expect(CALLBACK_1.mock.calls[0][1]).toBe(2) // test second param
      expect(CALLBACK_1.mock.results[0].value).toBe(3)
    })

    it('should apply correct context to callback', () => {
      const em = new Emithor()
      const callback = jest.fn(function cb() {
        return this.name
      })
      const contextName = 'context'
      const context = {
        name: contextName
      }

      em.on(EVENT_NAME_1, callback, context, false)

      em.trigger(EVENT_NAME_1)

      expect(callback.mock.results[0].value).toBe(contextName)
    })

    it('should trigger callback for event once', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1, null, true) // will be triggered once
      em.on(EVENT_NAME_1, CALLBACK_2)

      em.trigger(EVENT_NAME_1)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(CALLBACK_2.mock.calls.length).toBe(1)

      em.trigger(EVENT_NAME_1)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(CALLBACK_2.mock.calls.length).toBe(2)
    })

    it('should trigger single callback for event once and remove event', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1, null, true)

      em.trigger(EVENT_NAME_1)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(em.getEvents()).toEqual([])
    })

    it('should trigger single callback for event multiple times', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)

      em.trigger(EVENT_NAME_1, null, 1, 2)
      em.trigger(EVENT_NAME_1, null, 2, 2)
      em.trigger(EVENT_NAME_1, null, 3, 2)
      em.trigger(EVENT_NAME_1, null, 3, 2)

      expect(CALLBACK_1.mock.calls.length).toBe(4)
      expect(CALLBACK_1.mock.results[0].value).toBe(3)
      expect(CALLBACK_1.mock.results[1].value).toBe(4)
      expect(CALLBACK_1.mock.results[2].value).toBe(5)
      expect(CALLBACK_1.mock.results[2].value).toBe(5)
    })

    it('should trigger all callbacks for event', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1, CALLBACK_2)

      em.trigger(EVENT_NAME_1)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(CALLBACK_2.mock.calls.length).toBe(1)
    })

    it('should trigger all callbacks for event multiple times', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1, CALLBACK_2)

      em.trigger(EVENT_NAME_1)
      em.trigger(EVENT_NAME_1)
      em.trigger(EVENT_NAME_1)

      expect(CALLBACK_1.mock.calls.length).toBe(3)
      expect(CALLBACK_2.mock.calls.length).toBe(3)
    })

    it('should trigger events scoped by namespace', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_1_NAMESPACED_LVL_2, CALLBACK_2)
      em.on(EVENT_NAME_1_NAMESPACED_LVL_3, CALLBACK_3)

      em.trigger(EVENT_NAME_1)
      em.trigger(EVENT_NAME_1_NAMESPACED_LVL_2)
      em.trigger(EVENT_NAME_1_NAMESPACED_LVL_3)

      expect(CALLBACK_1.mock.calls.length).toBe(1)
      expect(CALLBACK_2.mock.calls.length).toBe(1)
      expect(CALLBACK_3.mock.calls.length).toBe(1)
    })

    it('should not trigger if specified event do not exist', () => {
      const em = new Emithor()

      // FIX: this test doesn't have sense
      expect(em.trigger(EVENT_NAME_1, null, 1, 2)).toBeFalsy()
      expect(em.trigger(EVENT_NAME_2)).toBeFalsy()
    })

    it('should throw error if cb fails', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_ERROR, true)

      expect(() => em.trigger(EVENT_NAME_1)).toThrow(Error)
    })
  })

  describe('remove method', () => {
    it('should remove whole events', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_2, CALLBACK_2)

      em.remove(EVENT_NAME_1)
      em.remove(EVENT_NAME_2)

      expect(em.getEvents()).toEqual([])
    })

    it("should not remove anything if specified event don't exist", () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1)
      em.on(EVENT_NAME_2, CALLBACK_2)

      em.remove(EVENT_NAME_EMPTY_EVENT)

      expect(em.getEvents()).toMatchSnapshot()
    })

    it('should remove specific callbacks', () => {
      const em = new Emithor()

      em.on(EVENT_NAME_1, CALLBACK_1, true)
      em.on(EVENT_NAME_2, CALLBACK_1, true)
      em.on(EVENT_NAME_2, CALLBACK_2, true)

      expect(em.getEvents()[1].cbs.length).toBe(2)

      em.remove(EVENT_NAME_2, CALLBACK_1)

      expect(em.getEvents()[1].cbs[0].fn).toEqual(CALLBACK_2)

      em.remove(EVENT_NAME_2, CALLBACK_2)

      expect(em.getEvents()).toMatchSnapshot()
    })
  })
})
