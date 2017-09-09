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

describe('Sanity test for concurrency', () => {
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

    it('simple test for concurrency Infinity', (done) => {
        request(server)
            .get('/')
            .expect(200, done)
    })



    it('simple test for concurrency with finite bound', (done) => {
        testConfig.concurrency = 200
        request(server)
            .get('/')
            .expect(200, done)
    })

})
