'use strict'

import Model from 'transwarp/src/Model'

export default class User extends Model {

  static schema = {

    id: {
      type: Number
    },

    username: {
      // type: 'VARCHAR(255)',
      type: String,
      required: true,
      unique: true,
      min: 1,
      max: 39,
      // alphanumeric -
      regexp: /^(?:[A-Za-z0-9]+-?)+[A-Za-z0-9]$/,
      validate: (value) => {
        return true
      }
    },

    email: {
      // type: 'VARCHAR(255)',
      type: String,
      required: true,
      unique: true
    },

    password: {
      // type: 'VARCHAR(255)',
      type: String,
      required: true,
      min: 7,
      max: 72,
      regexp: /[a-z0-9]/
    },

    salt: {
      type: String,
      // type: 'VARCHAR(255)',
      required: true
    },

    createdAt: {
      type: Date
    },

    updatedAt: {
      type: Date
    }

  }

  static boot() {
    this.hooks.saving((ctx, next) => {
      console.log('User saving')
      return next()
    })
    this.hooks.saved((ctx, next) => {
      console.log('User saved')
      return next()
    })
    this.hooks.creating((ctx, next) => {
      console.log('User creating')
      return next()
    })
    this.hooks.created((ctx, next) => {
      console.log('User created')
      return next()
    })
    console.log('Model: User is booted.')
  }

}
