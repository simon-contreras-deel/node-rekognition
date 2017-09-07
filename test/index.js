'use strict'

const Mocha = require('mocha')
const mocha = new Mocha({})

const debug = require('debug')('node-rekognition:test')

// Test suites
mocha.addFile(__dirname + '/integration/S3.js')
mocha.addFile(__dirname + '/integration/Rekognition.js')

mocha.run()
    .on('test', function(test) {
    })
    .on('test end', function(test) {
    })
    .on('pass', function(test) {
    })
    .on('fail', function(test, err) {
        if (process.env.NOTIFY == 1) {
            debug({
                'title': test.title,
                'message': test.file
            })
        }
    })
    .on('end', function() {
        process.exit()
    })