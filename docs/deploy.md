# futurespace


## Setup

### Locally

```bash
$ heroku plugins:install git://github.com/ddollar/heroku-config.git
$ heroku config:push --env .env.development
$ heroku run bash
```

### Heroku

```bash
$ ./node_modules/.bin/sequelize db:migrate
$ NODE_ENV=production ./node_modules/.bin/sequelize db:migrate
```
