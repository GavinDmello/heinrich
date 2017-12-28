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

describe('method tests', () => {
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

    it('basic get request', (done) => {
        request(server)
            .get('/')
            .expect(200, done)
    })

    it('basic post request', (done) => {
        request(server)
            .post('/status/200')
            .send("hi")
            .expect(200, done)

    })    

    it('basic put request', (done) => {
        request(server)
            .put('/status/200')
            .send("hi")
            .expect(200, done)

    })

    it('basic delete request', (done) => {
        request(server)
            .delete('/status/200')
            .send("hi")
            .expect(200, done)

    })

})
