'use strict'

import Trek from 'trek'

const app = new Trek(__dirname)
app.keys = ['futurespace.io', 'stackmeta.com']

app.on('error', (err, ctx) => {
  app.logger.error(err)
})

app.run(5000)
