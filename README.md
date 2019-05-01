# Emithor 📡

[![NPM version](https://img.shields.io/npm/v/emithor.svg?style=flat-square)](https://www.npmjs.com/package/emithor)
[![Build Status](https://travis-ci.com/josipovich/emithor.svg?token=FZzGMXwSK6fEdEg1qhdj&branch=master)](https://travis-ci.com/josipovich/emithor)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/emithor.svg)
[![codecov](https://codecov.io/gh/josipovich/emithor/branch/master/graph/badge.svg?token=yS2VUKbPBw)](https://codecov.io/gh/josipovich/emithor)

Simple pub-sub JavaScript implementation. 

## Features

- Attaching callbacks to custom events
- Triggering events and firing callbacks (with payload and context)
- Firing specific callbacks only once
- Removing events and specific callbacks

<!-- 
## Install

```sh
$ npm install emithor
// or 
$ yarn add emithor
```

-->

## Basic usage

Using `Emithor` is very simple. You have two options for importing:

```js
// Import class
import Emithor from 'emithor'
const emithor = new Emithor()

// ...Or import just what you want.
import { on, trigger } from 'emithor'

// Add event listeners
emithor.on('myEvent', () => { console.log('myEvent triggered') })
// ...And trigger event.
emithor.trigger('myEvent') // => 'myEvent triggered'
```

## API

Instance of `Emithor` exposes following methods: 

-   [on](#on)
-   [trigger](#trigger)
-   [remove](#remove)
-   [getEvents](#getEvents)

### on() 

*(alias: subscribe, register)*

Registers callback to specifeid event.

#### params

- `eventName` **String** - Can't be empty string
- `callback` **Function** - Callback to be executed when event triggers.
- `ctx` **Object** (default: null) - Context which is to be provided to callback
- `once` **Boolean** (default: false) - Controls if callback is going to be invoked only once

```js
// Register handleMyEvent handler 
// on event named 'myEvent'
emithor.on('myEvent', handleMyEvent)

// When 'myEvent' gets triggered callback
// will be invoked, but just the first time
emithor.on('myEvent', handleMyEvent, null, true)
```

### trigger() 

*(alias: publish, fire)*

Triggers specified event's callbacks and passes the same payload to all of them. Optianally you can 
override predefined context for all callbacks by passing another value for `this`.

#### params

- `eventName` **String**
- `context` **Any** - Value for `this` of the callback. If you don't need it, just use `null` instead.
- `payload` **Any** - Params to pass to callback call.

```js
// Let's first register our callback.
emithor.on('myEvent', () => { console.log('myEvent triggered') })

// Then trigger event without passing context and payload.
emithor.trigger('myEvent')
// => 'myEvent triggered'

// Add one more callback to event
emithor.on('myEvent', (a, b) => { console.log(a + b) })
// Triggering event fires all callbacks attached.
// Payload of `2, 2` is passed to all of them
emithor.trigger('myEvent', null, 2, 2)
// => 'myEvent triggered'
// => 4

// Add callback which requires both value for `this` and payload
emithor.on('myEvent', function(greeting) { 
  console.log(`${greeting} ${this.name}!`) 
})
// Create context 
const person = { name: 'Joe' }
// Passing context to `trigger` method overrides  
// context defined define with `on` menthod
emithor.trigger('myEvent', person, 'Hey')
// => 'Hey Joe!'
```

### remove() 

*(alias: unsubscribe)*

Removes an event or callback (or both). If callback is specified then it only removes callback.
If there are no more callbacks after callback is deleted then it removes whole specified event.

#### params

- `eventName` **String** - Can't be empty string
- `callback` **Function** (default: null) - Callback to be executed when event triggers.

```js
// Passing only event name removes 
// whole event with all of its callbacks.
emithor.remove('myEvent')

// Passing callback reference removes 
// that callback from given event.
emithor.remove('myEvent', callback)
```

### getEvents() 

*(alias: getChannels)*

Returns copy of all events. 

```js
console.log(emithor.getEvents()) 
// => [{name: 'event', cbs: [{fn: callback, ctx: null, once: false}]}]
```

## Usage examples

Pass `payload` and trigger event multiple times: 

```js
const emithor = new Emithor()

emithor.on('myEvent', (a, b) => { console.log(a + b) })
emithor.trigger('myEvent', null, 1, 2) // => 3
emithor.trigger('myEvent', null, 2, 2) // => 4
emithor.trigger('myEvent', null, 3, 2) // => 5
emithor.trigger('myEvent', null, 3, 2) // => 5
```

Trigger events multiple times, while some callbacks will be invoked only once: 

```js
const { on, trigger } from 'emithor'

on('myEvent', (a, b) => { console.log(a + b) }, null, true)
on('myEvent', (a, b) => { console.log('myEvent triggered') })
trigger('myEvent', null, 1, 2) 
// => 3
// => 'myEvent triggered'
trigger('myEvent', null, 1, 2) // => 'myEvent triggered'
trigger('myEvent') // => 'myEvent triggered'
```

Provide `this` value to the `callback`: 

```js
const { on, trigger } from 'emithor'
const context = { name: 'context' }
const handleMyEvent = function () { console.log(this.name) }

on('myEvent', handleMyEvent, context)
trigger('myEvent') // => 'context'
```

## License

MIT © [Vedran Josipovic](https://github.com/josipovich)
