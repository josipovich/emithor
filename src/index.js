// Private-like symbols for members
const addEvent = Symbol()
const deleteEvent = Symbol()
const getEvent = Symbol()
const addCallback = Symbol()
const deleteCallback = Symbol()
const events = Symbol()

/**
 * Class representation of pub-sub
 *
 * @class
 */
class Emithor {
  constructor() {
    this[events] = []
  }

  /**
   * Registers callback to specifeid event.
   *
   * @function
   * @public
   * @param {string} eventName - Can't be empty string
   * @param {function} callback
   * @param {object} ctx - Context which is to be provided to callback
   * @param {boolean} once - Controls if callback is going to be invoked only once
   */
  on = (eventName, callback, ctx = null, once = false) => {
    if (
      typeof eventName !== 'string'
      || eventName === ''
      || typeof callback !== 'function'
    ) return

    const newCallback = { fn: callback, once, ctx }

    // Add new event if that event don't exist already
    const event = this[getEvent](eventName) || null
    if (!event) {
      this[addEvent](eventName, newCallback, ctx, once)
      return
    }

    // Register callback to event if that callback
    // is not yet registered on that event
    const isCallbackRegistered = !!(
      event && event.cbs.find(cb => cb.fn === callback)
    )
    if (!isCallbackRegistered) {
      this[addCallback](eventName, newCallback)
    }
  }

  /**
   * Triggers specified event.
   *
   * It also passes payload to calback function.
   *
   * @function
   * @public
   * @param {string} eventName
   * @param {...*} payload - Params to pass to callback call.
   * @return {false} - If there is no event to trigger it returns false
   */
  trigger = (eventName, contextOverride, ...payload) => {
    const event = this[getEvent](eventName)

    if (!event) return

    event.cbs.forEach(cb => {
      try {
        cb.fn.call(contextOverride || cb.ctx, ...payload)
      } catch (error) {
        throw new Error(error)
      }
      if (cb.once) {
        this[deleteCallback](eventName, cb.fn)
      }
    })
  }

  /**
   * Removes an event or callback (or both).
   *
   * If callback is specified then it only removes callback.
   *
   * If there are no more callbacks  after callback is deleted
   * then it removes whole specified event.
   *
   * @function
   * @public
   * @param {string} eventName
   * @param {function} callback
   */
  remove = (eventName, callback = null) => {
    const event = this[getEvent](eventName) || null

    if (!event) return

    if (callback) {
      this[deleteCallback](eventName, callback)
    } else {
      this[deleteEvent](eventName)
    }
  }

  /**
   * Returns list of all events.
   *
   * @function
   * @public
   * @returns {array} - Copy of list of all events
   */
  getEvents = () => [...this[events]];

  /**
   * Adds specified event to event list.
   *
   * @function
   * @private
   * @param {string} eventName
   * @param {function} callback
   */
  [addEvent] = (eventName, newCallback) => {
    const newEvent = { name: eventName, cbs: [newCallback] }
    this[events] = [...this[events], newEvent]
  };

  /**
   * Deletes specified event.
   *
   * @function
   * @private
   * @param {string} eventName
   */
  [deleteEvent] = eventName => {
    this[events] = [...this[events]].filter(event => event.name !== eventName)
  };

  /**
   * Adds callback to specified event.
   *
   * @function
   * @private
   * @param {string} eventName
   * @param {function} callback
   */
  [addCallback] = (eventName, callback) => {
    this[events] = [...this[events]].map(e => {
      if (e.name === eventName) {
        e.cbs = [...e.cbs, callback]
      }
      return e
    })
  };

  /**
   * Deletes specified callback on specified event.
   *
   * If there are no more callbacks after callback is deleted
   * then it removes whole event.
   *
   * @function
   * @private
   * @param {string} eventName
   * @param {function} callback
   */
  [deleteCallback] = (eventName, callback) => {
    this[events] = [...this[events]].map(event => {
      if (event.name === eventName) {
        event.cbs = [...event.cbs].filter(cb => cb.fn !== callback)
      }
      return event
    })

    if (!this[getEvent](eventName).cbs.length) {
      this[deleteEvent](eventName)
    }
  };

  /**
   * Returns specifeid event.
   *
   * @function
   * @private
   * @param {string} eventName
   * @returns {object} - Event object.
   */
  [getEvent] = eventName => this[events].find(event => event.name === eventName)
}

// Private Emithor instace used to expose api
const emithor = new Emithor()
export const {
  on,
  remove,
  trigger,
  getEvents,
  // aliases
  on: register,
  on: subscribe,
  trigger: fire,
  trigger: publish,
  remove: unsubscribe,
  getEvents: getChannels
} = emithor

// Exposing constructor
export default Emithor
