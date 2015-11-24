'use strict'

import _ from 'lodash'
import { open, register } from 'transwarp'
import postgres from 'transwarp-postgres'

export default (app, config) => {

  register('postgres', postgres)

  const dsn = config.get('database')
  const db = open('postgres', dsn)
  db.logger = app.logger

  const models = app.models = Object.create(null)
  app.paths.get('app/models').forEach(m => {
    const Model = Trek.require(`${app.rootPath}/${m}`)

    Model.attach(db)
    Model.boot()

    Object.defineProperty(models, Model.name, {
      configurable: true,
      value: Model
    })
  })

  return db.ping().then(result => {
    app.logger.debug('DB is already connected.')
    return db
  })

}
