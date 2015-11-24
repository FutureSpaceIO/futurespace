'use strict'

import User from '../models/User'
import Test from '../models/Test'

var i = 0

export default {

  * index() {
    const db = this.getService('database')

    //let result = yield db.exec('SELECT current_database();')
    //console.log(result)
    //const lastUser  = yield this.app.models.User.last()
    //const firstUser = yield User.first()
    //const count     = yield User.count()
    //console.log(firstUser)
    //console.log(lastUser)
    //console.log(count)

    //lastUser.set('username', 'hells2007' + (i++))
    //yield lastUser.save()
    //console.log(lastUser)

    const t = new Test({
      name: '2333'
    })
    yield t.save()
    console.log('ttt', t)

    yield t.delete()
    console.log(t)

    // console.log(this.app.models.User.attributes)
    // console.log(User.db)

    //let lang = this.query.lang
    //let langCookie = this.cookies.get('lang')
    //if (lang && lang !== langCookie) {
    //  this.cookies.set('lang', lang)
    //} else {
    //  // defaults to `zh-CN`
    //  lang = langCookie || 'zh-CN'
    //}
    yield this.render('index', this.state)
  }

}
