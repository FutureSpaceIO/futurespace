import path from 'path';
import klm from 'koa-load-middlewares';

export default (app) => {
  let [config, ms, isProduction] = [app.config, klm(), Trek.isProduction];

  app.context.render = ms.swig({
    root: config.paths.get('app/views')
  });

  app.use(ms.morgan.middleware());
  app.keys = config.get('secrets').secretKeyBase;
  app.use(ms.bodyparser());
  app.use(ms.genericSession());
  app.use(ms.connectFlash());
};
