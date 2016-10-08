//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var request = require('supertest');
var server = require('../main');
var should = chai.should();

describe('testing status codes', () => {
    beforeEach((done) => {
        if (server) {
            done()
        }
    });

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
