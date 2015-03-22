// development

export default (config) => {

  config.set('views', {
    cache: false
  });

  // static cache
  config.set('static', {
    buffer: false,
    maxAge: 0,
    /*
    alas: {
      '/favicon.ico': '/favicon.png'
    }
    */
  });

  config.set('passport', {
    providers: [
      'twitter',
      'github'
    ],

    strategies: {
      local: {
        initialize: {
          // by default, local strategy uses username and password, we will override with email
          usernameField: 'user[identifier]',
          passwordField: 'user[password]',
          passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        authenticate: {
          // successRedirect: '/',
          // failureRedirect: '/login',
          // failureFlash: true
        }
      },
      bearer: {},
      twitter: {
        protocol: 'oauth',
        initialize: {
          consumerKey: config.env.TWITTER_CONSUMER_KEY,
          consumerSecret: config.env.TWITTER_CONSUMER_SECRET,
          callbackURL: '/auth/twitter/callback'
        },
        authenticate: {
          // successRedirect: '/',
          // failureRedirect: '/login',
          // failureFlash: true
        }
      },
      github: {
        protocol: 'oauth2',
        initialize: {
          //scope: ['user'],
          clientID: config.env.GITHUB_CLIENT_ID,
          clientSecret: config.env.GITHUB_CLIENT_SECRET,
          callbackURL: '/auth/github/callback'
        },
        authenticate: {
          // successRedirect: '/',
          // failureRedirect: '/login',
          // failureFlash: true
        }
      },
      digitalocean: {
        protocol: 'oauth2',
        initialize: {
          clientID: config.env.DIGITALOCEAN_CLIENT_ID,
          clientSecret: config.env.DIGITALOCEAN_CLIENT_SECRET,
          userProfileURL: 'https://api.digitalocean.com/v2/account',
          callbackURL: '/auth/digitalocean/callback'
        },
        authenticate: {
          // successRedirect: '/',
          // failureRedirect: '/login',
          // failureFlash: true
        },
        filter: (req, accessToken, refreshToken, profile, next) => {
          profile.id = profile._json.account.uuid;
          profile.email = profile._json.account.email;
          console.dir(profile)
          console.log('digitalocean filter')
          return [req, accessToken, refreshToken, profile, next];
        }
      },
      bitbucket: {
        protocol: 'oauth',
        initialize: {
          consumerKey: config.env.BITBUCKET_CONSUMER_KEY,
          consumerSecret: config.env.BITBUCKET_CONSUMER_SECRET,
          callbackURL: '/auth/bitbucket/callback'
        },
        authenticate: {
          // successRedirect: '/',
          // failureRedirect: '/login',
          // failureFlash: true
        }
      }
    }
  });
};
