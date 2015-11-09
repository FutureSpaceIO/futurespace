import nunjucks from 'nunjucks'
import locale from 'koa-locale'
import i18n from 'koa-i18n'

/**
 * Middleware
 */
export default (app, config) => {

  const middlewareConfig = config.get('middleware') || Object.create(null)

  const publicFolder = app.paths.get('public', true)

  app.static('/bower_components', `${publicFolder}/bower_components`)
  app.static('/scripts', `${publicFolder}/scripts`)
  app.static('/styles', `${publicFolder}/styles`)
  app.static('/images', `${publicFolder}/images`)

  if (Trek.isDevelopment) {
    nunjucks.configure({ noCache: true })
  }

  // view render
  app.engine('html', function render(view, options) {
    return new Promise((resolve, reject) => {
      nunjucks.render(view, options, (err, res) => {
      err ? reject(err) : resolve(res)
      })
    })
  })

  // logger for query
  if (Trek.isDevelopment) {
    app.use(require('koa-logger')())
  }


  // bodyparser
  app.use(require('koa-bodyparser')(middlewareConfig.bodyparser))


  // method-override
  const methodOverride = middlewareConfig.methodoverride
  if (methodOverride) {
    app.use(require('koa-methodoverride')(methodOverride.getter, methodOverride.options))
  }


  // session
  let session = {
    key: 'trek.sid',
    prefix: 'trek:sess:'
  }
  let store = middlewareConfig.session && middlewareConfig.session.store
  Object.assign(
    session,
    middlewareConfig.session,
    {
      //store: Trek.isProduction && require('koa-redis')(store)
    }
  )
  app.use(require('koa-generic-session')(session))


  // compress
  const compress = config.get('middleware.compress')
  if (compress) {
    app.use(require('koa-compress')(compress))
  }

  // i18n & locale
  locale(app, 'lang')
  app.use(i18n(app, {
    directory: `${config.root}/config/locales`,
    extension: '.json',
    locales: ['zh-CN', 'en'],
    modes: ['query', 'cookie']
  }))

}
