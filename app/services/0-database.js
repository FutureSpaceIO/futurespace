'use strict'

import _ from 'lodash'
import { open, register } from 'transwarp'
import postgres from 'transwarp-postgres'

export default (app, config) => {

  register('postgres', postgres)

  const db = open('postgres', 'postgres://yzyj@192.168.99.100/yizuyijie_dev')
  // db.logger = app.logger

  const models = app.models = Object.create(null)
  app.paths.get('app/models').forEach(m => {
    const Model = Trek.require(`${app.rootPath}/${m}`)

    Model.attach(db)

    Object.defineProperty(models, Model.name, {
      configurable: true,
      value: Model
    })
  })

  return db

}
