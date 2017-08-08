/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

//Requiring the dev-dependencies
var request = require('supertest')
var testConfig = require('./test-config.json')

describe('black list test', () => {
    var server
    var originalCache = require('../config.json')
    beforeEach((done) => {
        var resolved = require('path').resolve('./config.json')
        require.cache[resolved] = {
            id: resolved,
            filename: resolved,
            loaded: true,
            exports: testConfig
        }
        server = require('../main')
        if (server) {
            done()
        }
    })

    it('block blacklisted user', (done) => {
        request(server)
            .get('/')
            .set('X-Forwarded-For', '192.168.2.1')
            .expect(500, done)
    })

})
