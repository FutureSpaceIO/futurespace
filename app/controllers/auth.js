import _ from 'lodash-node';

export default {

  // endpoint: GET /login
  // show: Log in
  * login() {
    yield this.render('auth/login', {
      errors: this.flash('error'),
      providers: this.config.get('passport.providers')
    });
  },

  // endpoint: GET /signup
  // show: Sign up
  * signup() {
    yield this.render('auth/signup', {
      errors: this.flash('error')
    });
  },

  // endpoint: POST /signout
  // show: Sign out
  * signout() {
    this.flash();
    this.logout();
    this.redirect('/');
  },

  // endpoint GET /auth/:provider
  * provider() {
    let passport = this.getService('passport');
    yield passport.endpoint(this, this.params.provider);
  },

  // endpoint GET   /auth/github
  // endpoint GET   /auth/github/callback
  // endpoint POST  /auth/local
  // endpoint POST  /auth/local/register
  * callback(next) {
    let ctx = this;
    let { provider, action } = this.params;
    let passport = this.getService('passport');
    try {
      yield* passport.callback(this, provider, action, function*(err, user, info) {
        if (user) {
          yield ctx.login(user);
          return ctx.redirect('/');
        }
        if (err) return tryAgain(err);
      }).call(this, next);
    } catch (e) {
      this.logger.error('error', e && e.stack)
      return tryAgain(e);
    }

    function tryAgain(err) {
      let action = ctx.params.action;
      if (action === 'register' && err && err.name === 'ValidationError') {
        err = _.filter(err.details, 'message');
        err = _.compact([
          _.find(err, 'path', 'username'),
          _.find(err, 'path', 'email'),
          _.find(err, 'path', 'password')
        ]);
      }
      ctx.flash('error', err);
      switch (action) {
        case 'register':
          ctx.redirect('/signup');
          break;
        case 'disconnect':
          ctx.redirect('back');
          break;
        default:
          ctx.redirect('/login');
      }
    }
  }

};
