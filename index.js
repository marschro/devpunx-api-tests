'use strict'

const fs        = require('fs')
const http      = require('http')
const async     = require('async')
const config    = require('config')
const colors    = require('colors/safe')
const request   = require('request')
const Table     = require('cli-table')
const validate  = require('./lib/helpers').validate


function test() {
  const dso       = {}
  const tests     = config.get('tests')
  const port      = config.get('port')
  const apiKey    = config.get('apiKey')
  const basicAuth = config.get('UseBasicAuth')

  let testNumber  = 0
  let passed      = 0

  let host = function() {
    if (!basicAuth) return 'http://127.0.0.1:' + port
    else return 'http://test:'+ apiKey +'@127.0.0.1:' + port
  }()


  let table = new Table({
    head: ['','Test','Passed','Expected','Received','Message','Content'],
    colWidths: [4, 50, 8, 10, 10, 15, 50]
  })

  async.eachSeries(tests, (test, callback) => {

    let url   = host + test.path + '?' + test.params.join('&')
    let json  = test.json ? test.json : null

    let form  = {
      data: fs.createReadStream(__dirname + '/testfile.txt')
    }

    request({
      url: url,
      method: test.method,
      json: json,
      formData: function () { if (test.method === 'PUT') return form}(),
    }, function (err, res, body) {
      if (err) callback(err)
      else {
        validate(res, test.expected, (failed) => {
          let success = failed ? 'FAILED' : '√'
          if (!failed) passed = passed + 1
          testNumber = testNumber + 1
          table.push([
            testNumber, test.name,
            success, test.expected.statusCode,
            res.statusCode, res.statusMessage, body
          ])
          callback(null)
        })
      }
    })
  }, (err) => {
    if (err) console.log(err)
    else {
      let all             = Object.keys(tests).length
      let failed          = Object.keys(tests).length - passed
      let authString      = basicAuth
        ? 'Basic Authentication'
        : 'Query Parameter'
      let pathToDataFiles = __dirname.split('node_modules')[0] + 'datafiles/'

      fs.readdir(pathToDataFiles, (err, files) => {
        if (err) console.error(err)
        else {
          console.log('\n')
          console.log(table.toString())
          console.log(colors.magenta(`Passed:\t\t${passed} of ${all} - (${failed} failed)`))
          console.log(colors.magenta(`Auth Mode:\t${authString}`))
          console.log(colors.magenta(`DataStore:\t${Object.keys(dso).length}`))
          console.log(colors.magenta(`DataFiles:\t${files.length}`))
        }
      })
    }
  })
}

module.exports = test
