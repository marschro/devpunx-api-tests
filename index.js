'use strict'

const fs        = require('fs')
const http      = require('http')
const async     = require('async')
const colors    = require('colors/safe')
const request   = require('request')
const Table     = require('cli-table')
const validate  = require('./lib/helpers').validate
const initFile  = require('./lib/helpers').initTestfile

class Test {
        constructor(filepath) {
            this.filepath   = filepath + '.json5';
            this.config     = null
        }

        run() {
            initFile(this.filepath, (data) => {
                this.config = data
                this.test()
            })
        }

        test() {
            let protocol    = this.config.protocol
                ? this.config.protocol
                : 'http'
            let host        = this.config.host
                ? this.config.host
                : '127.0.0.1'
            let port        = this.config.port
                ? ':' + this.config.port
                : ''
            let basicAuth   = this.config.UseBasicAuth
                ? this.config.UseBasicAuth
                : false
            let tests       = this.config.tests


            let testNumber  = 0
            let passed      = 0

            let scheme = function() {

                if (basicAuth) {
                    if (!basicAuth.username) throw new Error('BasicAuth username missing!')
                    else if (!basicAuth.password) throw new Error('BasicAuth password missing!')
                    else {
                        let url = [
                            'http://',
                            basicAuth.username,
                            ':',
                            basicAuth.password,
                            '@',
                            host,
                            port
                        ]
                        return url.join('')
                    }
                }
                else {
                    let url = [
                        'http://',
                        host,
                        port
                    ]
                    return url.join('')
                }
            }()



            let table = new Table({
                head: ['','Test','Passed','Expected','Received','Message','Content'],
                colWidths: [4, 50, 8, 10, 10, 15, 50]
            })

            async.eachSeries(tests, (test, callback) => {
                let name = test.name
                    ? test.name
                    : 'unnamed'
                let url   = scheme + test.path + '?' + test.parameter.join('&')
                let json  = test.json ? test.json : null

                let form  = {
                    data: fs.createReadStream(__dirname + '/lib/testfile.txt')
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
                                testNumber, name + '\n' + url,
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
                    console.log('\n')
                    console.log(table.toString())
                    console.log(colors.magenta(`Passed:\t\t${passed} of ${all} - (${failed} failed)`))
                    console.log(colors.magenta(`Auth Mode:\t${authString}`))
                }
            })
        }
    }



module.exports = Test
