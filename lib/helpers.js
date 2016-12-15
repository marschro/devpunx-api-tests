'use strict'

const async   = require('async')


module.exports = {
  validate: function (res, expected, callback) {
    async.each(Object.keys(expected), (key, callback) => {

      switch (key) {

        case 'statusCode':
          if (res.statusCode === expected[key]) callback()
          else callback('failed')
          break

        case 'response':
          if (typeof(expected[key]) === 'object') {
            let a = res.body
            let b = JSON.stringify(expected[key])
            if (a === b) callback()
            else callback('failed')
          }
          else if (typeof(expected[key]) !== 'object') {
            if (expected.response === expected[key]) callback()
            else callback('failed')
          }
          else callback('failed')
          break

        default:
          throw new Error('Validation Error! No definition for expected.' + key)
      }
    }, (failed) => {
      if (failed) callback('Test failed')
      else callback()
    })
  }
}