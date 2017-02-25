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

describe('testing status codes', () => {
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

    it('status code 405', (done) => {
        request(server)
            .post('/status/405')
            .expect(405, done)
    })

    it('status code 200', (done) => {
        request(server)
            .post('/status/200')
            .send("hi")
            .expect(200, done)

    })

    it('status code 500', (done) => {
        request(server)
            .post('/status/500')
            .send("hi")
            .expect(500, done)

    })

    it('status code 404', (done) => {
        request(server)
            .post('/status/500')
            .send("hi")
            .expect(500, done)

    })

    it('status code 503', (done) => {
        request(server)
            .post('/status/500')
            .send("hi")
            .expect(500, done)
    })

})
