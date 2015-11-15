'use strict'

import Trek from 'trek'

const app = new Trek(__dirname)

app.on('error', (err, context) => {
  app.logger.error(err)
})

app.run(5000)
