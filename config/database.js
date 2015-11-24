'use strict'

// postgres://yzyj@192.168.99.100/yizuyijie_dev
const development = {
  user: "yzyj",
  password: null,
  // database: "futurespace_dev",
  database: "yizuyijie_dev",
  host:     "192.168.99.100",
  dialect:  "postgres"
}

const test = {
  user: "postgres",
  password: null,
  database: "futurespace_test",
  host:     "127.0.0.1",
  dialect:  "postgres"
}

const production = {
  user: "futurespace",
  password: null,
  database: "futurespace",
  host:     "127.0.0.1",
  dialect:  "postgres"
}

module.exports = {

  development,

  production,

  test

}
