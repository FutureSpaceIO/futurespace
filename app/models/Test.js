'use strict'

import Model from 'transwarp/src/Model'

export default class Test extends Model {

  static schema = {

    id: {
      type: Number
    },

    name: {
      // type: 'VARCHAR(255)',
      type: String
    }
  }

  static boot() {
    this.hooks.saving((ctx, next) => {
      console.log('Test saving - round 0')
      return next()
    })
    this.hooks.saving((ctx, next) => {
      console.log('Test saving - round 1')
      return next()
    })
    this.hooks.saved((ctx, next) => {
      console.log('Test saved')
      return next()
    })
    this.hooks.creating((ctx, next) => {
      console.log('Test creating')
      return next()
    })
    this.hooks.created((ctx, next) => {
      console.log('Test created')
      return next()
    })
    console.log('Model: Test is booted.')
  }

}
