import Trek from 'trek';

var app = new Trek(__dirname);

app.on('error', function (err, context) {
  app.logger.error(err);
});

app.run();
