import url from 'url';
import _ from 'lodash-node';
import chalk from 'chalk';
import co from 'co';
import passport from 'passport';

export default (app, config) => {
  let models = app.getService('sequelize');
  let UserModel = models.User;
  let PassportModel = models.Passport;
  let settings = config.get('passport');

  passport.serializeUser((user, done) => {
    done(null, user.id || 0);
  });

  passport.deserializeUser((id, done) => {
    UserModel.findOne({
      where: {
        id: id
      },
    }).done((err, user) => {
      if (user) {
        let emailHash = user.emailHash();
        user = user.toJSON();
        user.emailHash = emailHash;
        // Ignores password, password_hash, salt fileds into the session.
        delete user.password_hash;
        delete user.salt;
      }
      done(err, user);
    });
  });

  let protocols = {

    local: {

      register: function(done) {
        return function* register() {
          let o = _.pick(this.request.body, 'email', 'username', 'password');
          let result = UserModel.validate(o);
          if (result.error) throw result.error;
          let [user, created] = yield UserModel.findOrCreate({
            where: {
              username: o.username,
              email: o.email
            }
          });
          if (created) {
            let salt = yield UserModel.salt();
            let password_hash = yield UserModel.hash(o.password, salt);
            yield user.update({
              password_hash: password_hash,
              salt: salt
            });
            yield done(null, user.get());
            return;
          }
          yield done(new Error('There were problems creating your account.'));
        };
      },

      connect: function(done) {
        return function* connect() {
          let user = this.user;
          let __passport;

          try {
            __passport = PassportModel.findOne({
              where: {
                protocol: 'local',
                user_id: user.id
              }
            });

            if (!__passport) {
              yield PassportModel.create({
                protocol: 'local',
                user_id: user.id
              });
            }

            yield done(null, user);
          } catch (err) {
            yield done(err, null);
          }

        };
      },

      login: function(req, identifier, password, done) {
        co(function*() {
            let user = yield UserModel.findByUsernameOrEmail(identifier);
            // Make sure user set the password.
            // If not, notify him to set password.
            if (user && user.password_hash) {
              let { password_hash, salt } = user;
              let verified = UserModel.compare(password_hash, password, salt);
              if (verified) return user;
            }
            throw new Error('Password or Email/Username wrong.');
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
        tokens: {
          token: token
        }
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
        tokens: {
          accessToken: accessToken
        }
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
          passReqToCallback: true,
          customHeaders: {
            'User-Agent': config.get('site.host')
          }
        };
        Object.keys(this.strategies).forEach((key) => {
          let { options, filter, Strategy } = this.strategies[key];
          try {
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
                var baseUrl = config.get('site.protocol') + '://' + config.get('site.host');
                if (config.env.LOCALLY) {
                  baseUrl += ':' + config.get('site.port');
                }
                switch (protocol) {
                  case 'oauth':
                  case 'oauth2':
                    options.callbackURL = url.resolve(baseUrl, options.callbackURL);
                    break;

                  case 'openid':
                    options.returnURL = url.resolve(baseUrl, callback);
                    options.realm = baseUrl;
                    options.profile = true;
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
            console.log(e.stack)
            app.logger.error(`Missing passport-${key}.`);
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
      value: function(req, query, profile, next) {
        console.log(profile.username, profile.displayName, profile.name, profile.email);
        var user = {},
          provider;

        // Get the authentication provider from the request.
        query.provider = req.ctx.params.provider || (req.query && req.query.provider) || (req.body && req.body.provider);

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
        if (profile.emails) {
          user.email = profile.emails[0].value;
        } else if (profile.email) {
          user.email = profile.email;
        }
        // If the profile object contains a username, add it to the user.
        if (profile.username) {
          user.username = profile.username;
        }

        // If neither an email or a username was available in the profile, we don't
        // have a way of identifying the user in the future. Throw an error and let
        // whoever's next in the line take care of it.
        if (!user.username && !user.email) {
          return next(new Error('Neither a username or email was available'));
        }

        console.log(query, provider, profile);
        console.log('req.user', req.user);
        console.log('user', user);
        co(function*() {
            let __passport = yield PassportModel.findOne({
              where: {
                provider: provider,
                identifier: query.identifier.toString()
              }
            });
            if (!req.user) {
                console.log('!req.user')
                // Scenario: A new user is attempting to sign up using a third-party
                //           authentication provider.
                // Action:   Create a new user and assign them a passport.
              if (!__passport) {
                console.log('!passport')
                // Don't use `username` to search, Unsafe.
                let __user = yield UserModel.findByEmail(user.email);
                if (!__user) {
                  __user = yield UserModel.create(user);
                }
                query.user_id = __user.id;
                query.profile = profile._json;
                _.defaults(query, user);
                yield PassportModel.create(query);

                next(null, __user);
              } else {
                _.defaults(query, user);
                yield __passport.update(query);

                let __user = yield UserModel.findOne(__passport.get('user_id'));
                next(null, __user);
              }
            } else {
              // Scenario: A user is currently logged in and trying to connect a new
              //           passport.
              // Action:   Create and assign a new passport to the user.
              if (__passport) {
                query.user_id = req.user.id;
                query.profile = profile._json;
                _.defaults(query, user);
                yield __passport.update(query);
              }
              next(null, req.user);
            }
          }).catch(next)
      }
    },

    disconnect: {
      value: function(done) {
        return function* disconnect() {
          let user = this.user;
          let provider = this.params.provider;

          let __passport = yield PassportModel.findOne({
            where: {
              user_id: user.id,
              provider: provider
            }
          });

          // Maybe do not really destory, just add a flag, likes: `delete_at`.
          yield __passport.destroy();
          yield done(null, user);
        }
      }
    },

    endpoint: {
      value: function(ctx, provider = 'local', next) {
        let strategies = this.strategies;
        if (!_.has(strategies, provider)) {
          return function* redirectToLogin() {
            return this.redirect('/login');
          };
        }

        return this.authenticate(provider, next);
      }
    },

    callback: {
      value: function(ctx, provider = 'local', action, next) {
        if (provider === 'local' && action) {
          if (action === 'register' && !ctx.user) {
            return protocols.local.register(next);
          } else if (action === 'connect' && ctx.user) {
            return protocols.local.connect(next);
          } else if (action === 'disconnect' && ctx.user) {
            return this.disconnect(next);
            // return protocols.local.disconnect(next);
          }
        } else {
          if (action === 'disconnect' && ctx.user) {
            return this.disconnect(next);
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
