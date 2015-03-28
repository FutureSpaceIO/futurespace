// Application defults config

export default (config) => {

  config.set('site', {
    protocol: 'http',
    host: process.env.HOST || '127.0.0.1',
    port: process.env.PORT || 3000
  }, true);

  config.set('views', {
    root: config.viewsPath
  }, true);

  config.set('lusca', {
    csrf: true
  });

};
