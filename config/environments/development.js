// development

import _ from 'lodash-node';

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
      'Facebook',
      'Google',
      'Twitter',
      'GitHub'
    ],

    strategies: {
      local: {
        Strategy: require('passport-local').Strategy,
        options: {
          // by default, local strategy uses username and password, we will override with email
          usernameField: 'user[identifier]',
          passwordField: 'user[password]',
          passReqToCallback: true // allows us to pass back the entire request to the callback
        }
      },
      bearer: {},
      facebook: {
        protocol: 'oauth2',
        Strategy: require('passport-facebook').Strategy,
        options: {
          scope: ['email', 'public_profile'],
          profileFields: ['id', 'name', 'displayName', 'emails', 'photos'],
          clientID: config.env.FACEBOOK_CLIENT_ID,
          clientSecret: config.env.FACEBOOK_CLIENT_SECRET,
          callbackURL: '/auth/facebook/callback'
        },
        filter: (req, accessToken, refreshToken, profile, next) => {
          // Facebook remove the `username` field in the latest API.
          if (!profile.username) {
            if(profile.displayName) {
              profile.username = _.kebabCase(profile.displayName);
            } else if (profile.name) {
              let name = _.compact(_.pick(profile.name, 'givenName', 'familyName'));
              profile.username = _.kebabCase(name.join('-'));
            }
          }
          return [req, accessToken, refreshToken, profile, next];
        }
      },
      google: {
        protocol: 'oauth2',
        Strategy: require('passport-google-oauth').OAuth2Strategy,
        options: {
          scope: ['email', 'profile'],
          clientID: config.env.GOOGLE_CLIENT_ID,
          clientSecret: config.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/auth/google/callback'
        },
        filter: (req, accessToken, refreshToken, profile, next) => {
          if (!profile.username) {
            if (profile.nickname) {
              profile.username = _.kebabCase(profile.nickname);
            } else if (profile.name) {
              let name = _.compact(_.pick(profile.name, 'givenName', 'familyName'));
              profile.username = _.kebabCase(name.join('-'));
            }
          }
          return [req, accessToken, refreshToken, profile, next];
        }
      },
      twitter: {
        protocol: 'oauth',
        Strategy: require('passport-twitter').Strategy,
        options: {
          consumerKey: config.env.TWITTER_CONSUMER_KEY,
          consumerSecret: config.env.TWITTER_CONSUMER_SECRET,
          callbackURL: '/auth/twitter/callback'
        }
      },
      github: {
        protocol: 'oauth2',
        Strategy: require('passport-github').Strategy,
        options: {
          //scope: ['user'],
          clientID: config.env.GITHUB_CLIENT_ID,
          clientSecret: config.env.GITHUB_CLIENT_SECRET,
          callbackURL: '/auth/github/callback'
        }
      },
      // digitalocean: {
      //   protocol: 'oauth2',
      //   Strategy: require('passport-digitalocean').Strategy,
      //   options: {
      //     clientID: config.env.DIGITALOCEAN_CLIENT_ID,
      //     clientSecret: config.env.DIGITALOCEAN_CLIENT_SECRET,
      //     userProfileURL: 'https://api.digitalocean.com/v2/account',
      //     callbackURL: '/auth/digitalocean/callback'
      //   },
      //   filter: (req, accessToken, refreshToken, profile, next) => {
      //     profile.id = profile._json.account.uuid;
      //     profile.email = profile._json.account.email;
      //     return [req, accessToken, refreshToken, profile, next];
      //   }
      // },
      // bitbucket: {
      //   protocol: 'oauth',
      //   Strategy: require('passport-bitbucket').Strategy,
      //   options: {
      //     consumerKey: config.env.BITBUCKET_CONSUMER_KEY,
      //     consumerSecret: config.env.BITBUCKET_CONSUMER_SECRET,
      //     callbackURL: '/auth/bitbucket/callback'
      //   }
      // }
    }
  });
};
