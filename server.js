import Trek from 'trek'

const app = new Trek(__dirname)

app.on('error', function (err, context) {
  app.logger.error(err)
})

app.run(5000)
