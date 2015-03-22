import url from 'url';
import _ from 'lodash-node';
import chalk from 'chalk';
import co from 'co';

export default (app, config) => {
  let passport = app.getService('passport');
  let models = app.getService('sequelize');
  let UserModel = models.User;
  let PassportModel = models.Passport;
  let settings = config.get('passport');

  passport.serializeUser((user, done) => {
    done(null, user.id || 0);
  });

  passport.deserializeUser((id, done) => {
    UserModel.find({
      where: {
        id: id
      },
    }).done((err, user) => {
      if (user) {
        user = user.toJSON();
        // Ignores password, password_hash, salt fileds into the session.
        delete user.password_hash;
        delete user.salt;
      }
      done(err, user);
    });
  });

  let protocols = {

    local: {

      register: function*(next) {
        let o = _.pick(this.request.body, 'email', 'username', 'password');
        let result = UserModel.validate(o);
        if (result.error) throw result.error;
        let salt = yield UserModel.salt();
        let password_hash = yield UserModel.hash(o.password, salt);
        return yield UserModel.build({
          username: o.username,
          email: o.email,
          salt: salt,
          password_hash: password_hash
        }).save();
      },

      login: function(req, identifier, password, done) {

        co(function*() {
            let user = yield UserModel.findByUsernameOrEmail(identifier);
            if (user && yield UserModel.compare(user.password_hash, password, user.salt)) {
              return user;
            } else {
              throw new Error('Password or identifier wrong.');
            }
          })
          .then((user) => {
            done(null, user);
          })
          .catch((err) => {
            done(err, false);
            app.logger.error(chalk.bold.red(err));
          });

      }
    },

    oauth: function(req, token, tokenSecret, profile, next) {
      var query = {
        identifier: profile.id,
        protocol: 'oauth',
        tokens: { token: token }
      };
      if (tokenSecret) {
        query.tokens.tokenSecret = tokenSecret;
      }

      passport.connect(req, query, profile, next);
    },

    oauth2: function(req, accessToken, refreshToken, profile, next) {
      var query = {
        identifier: profile.id,
        protocol: 'oauth2',
        tokens: { accessToken: accessToken }
      };
      if (refreshToken) {
        query.tokens.refreshToken = refreshToken;
      }

      passport.connect(req, query, profile, next);
    }

  };


  Object.defineProperties(passport, {

    loadStrategies: {
      value: function() {
        let defaultOptions = {
          passReqToCallback: true
        };
        Object.keys(this.strategies).forEach((key) => {
          let options = this.strategies[key].initialize;
          let filter = this.strategies[key].filter;
          let Strategy;
          try {
            Strategy = require(`passport-${key}`).Strategy;
            switch (key) {
              case 'local':
                _.defaults(options, defaultOptions, {
                  usernameField: 'identifier'
                });
                this.use(new Strategy(options, protocols.local.login));
                break;

              case 'bear':
                break;

              default:
                _.defaults(options, defaultOptions);
                var protocol = this.strategies[key].protocol;
                var baseUrl = config.get('site.protocol') + '://' + config.get('site.host') + ':' + config.get('site.port');
                switch (protocol) {
                  case 'oauth':
                  case 'oauth2':
                    options.callbackURL = url.resolve(baseUrl, options.callbackURL);
                    break;

                  case 'openid':
                    options.returnURL = url.resolve(baseUrl, callback);
                    options.realm     = baseUrl;
                    options.profile   = true;
                }
                this.use(new Strategy(
                  options,
                  filter ? (...args) => {
                    args = filter(...args);
                    protocols[protocol](...args)
                  } : protocols[protocol]
                ));
            }
          } catch (e) {
            app.logger.error(`Missing passport-${key}, ${e.stack}`);
          }
        });
      }
    },

    strategies: {
      get: function() {
        return settings.strategies;
      }
    },

    connect: {
      value: function (req, query, profile, next) {
        var user = {}, provider;

        // Get the authentication provider from the request.
        query.provider = req.ctx.params.provider || req.query && req.query.provider || req.body && req.body.provider;

        // Use profile.provider or fallback to the query.provider if it is undefined
        // as is the case for OpenID, for example
        provider = profile.provider || query.provider;

        // If the provider cannot be identified we cannot match it to a passport so
        // throw an error and let whoever's next in line take care of it.
        if (!provider) {
          return next(new Error('No authentication provider was identified.'));
        }

        // If the profile object contains a list of emails, grab the first one and
        // add it to the user.
        if (_.has(profile, 'email')) {
          user.email = profile.email;
        }
        // If the profile object contains a username, add it to the user.
        if (_.has(profile, 'username')) {
          user.username = profile.username;
        }

        // If neither an email or a username was available in the profile, we don't
        // have a way of identifying the user in the future. Throw an error and let
        // whoever's next in the line take care of it.
        if (!user.username && !user.email) {
          return next(new Error('Neither a username nor email was available'));
        }

        console.log(query, provider)
        co(function* () {
          let __passport = yield PassportModel.findOne({
            where: {
              provider: provider,
              identifier: query.identifier.toString()
            }
          });
          if (!__passport) {

          }
          console.log(__passport, req.user)
        }).catch(next)
      }
    },

    disconnect: {
      value: function*(next) {

      }
    },

    endpoint: {
      value: function(ctx, provider = 'local') {
        let strategies = this.strategies;
        if (!_.has(strategies, provider)) {
          return function* redirectToLogin() {
            return this.redirect('/login');
          };
        }

        let options = strategies[provider] && strategies[provider].authenticate || Object.create(null);
        return this.authenticate(provider, options);
      }
    },

    callback: {
      value: function(ctx, provider = 'local', action, next) {
        if (provider === 'local' && action) {
          if (action === 'register' && !ctx.user) {
            return protocols.local.register;
          } else if (action === 'connect' && ctx.user) {

          } else if (action === 'disconnect' && ctx.user) {

          }
        } else {
          if (action === 'disconnect' && ctx.user) {
            return this.disconnect();
          } else {
            console.log(provider, action);
            return this.authenticate(provider, next);
          }
        }

      }
    }

  })

  passport.loadStrategies();
  return passport;
};
