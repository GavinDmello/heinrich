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

describe('outstream SSL test', () => {
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

    it('Get test for outstream', (done) => {
        testConfig.servers.host = 'https://httpbin.org'
        request(server)
            .get('/')
            .expect(200, done)
    })

    it('post test for outstream', (done) => {
        testConfig.servers.host = 'https://httpbin.org'
        request(server)
            .post('/status/200')
            .send("hi")
            .expect(200, done)

    })

})
