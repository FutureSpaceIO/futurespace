
export default (routeMapper) => {

  routeMapper

    .root('welcome#index')

    .get('login', { to: 'auth#login' })

    .get('signup', { to: 'auth#signup' })

    .get('signout', { to: 'auth#signout' })

    //.get('forgot')

    .post('auth/local', { to: 'auth#callback' })
    .post('auth/local/:action', { to: 'auth#callback' })

    // third party: twitter, github, google
    .get('auth/:provider', { as: 'authProvider', to: 'auth#provider' })
    .get('auth/:provider/:action', { to: 'auth#callback' })

};
