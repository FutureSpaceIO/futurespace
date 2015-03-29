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
      errors: this.flash('error'),
      providers: this.config.get('passport.providers')
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
  * provider(next) {
    let passport = this.getService('passport');
    yield passport.endpoint(this, this.params.provider, next);
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
        console.log(err, user, info);
        if (user) {
          yield ctx.login(user);
          return ctx.redirect('/');
        }
        if (!user && info) return tryAgain(info);
        if (err) return tryAgain(err);
        if (!err) return tryAgain(new Error('Something was wrong.'));
      }).call(this, next);
    } catch (e) {
      this.logger.error(e && e.stack)
      return tryAgain(e);
    }

    function tryAgain(err) {
      if (action === 'register' && err && err.name === 'ValidationError') {
        err = _.filter(err.details, 'message');
        err = _.compact([
          _.find(err, 'path', 'username'),
          _.find(err, 'path', 'email'),
          _.find(err, 'path', 'password')
        ]);
      }
      /**
       * error format:
       *  { message: ''}
       * errors:
       *  [ error, error ]
       */
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
