
export default (routeMapper) => {

  routeMapper

    .root('welcome#index', { format: false })

    .get('login', { to: 'auth#login', format: false })

    .get('join', { to: 'auth#signup', format: false })

    .get('logout', { to: 'auth#signout', format: false })

    //.get('forgot')

    .post('auth/local', { to: 'auth#callback', format: false })
    .post('auth/local/:action', { to: 'auth#callback', format: false })

    // third party: twitter, github, google
    .get('auth/:provider', { as: 'authProvider', to: 'auth#provider', format: false })
    .get('auth/:provider/:action', { to: 'auth#callback', format: false })

};
