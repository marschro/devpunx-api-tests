'use strict'

const async = require('async')
const fs    = require('fs')
const JSON5 = require('json5');

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
    },

    initTestfile: function(path, callback) {
        fs.stat(path, (err, stats) => {
            if (err) throw err
            else {
                fs.readFile(path, {encoding:'utf8'},(err, data) => {
                    if (err) throw err
                    else {
                        let obj = JSON5.parse(data)
                        callback(obj)
                    }
                })
            }
        })
    }
}
