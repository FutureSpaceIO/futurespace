
export default {

  * index() {
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
