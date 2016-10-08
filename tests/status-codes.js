//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Requiring the dev-dependencies
var request = require('supertest');
var server = require('../main');

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
