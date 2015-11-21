'use strict'

import Model from 'transwarp/src/Model'

export default class Test extends Model {

  static schema = {

    id: {
      type: Number
    },

    name: {
      // type: 'VARCHAR(255)',
      type: String
    }
  }

}
