//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Requiring the dev-dependencies
var request = require('supertest');
var server = require('../main');

describe('simple tests', () => {
    beforeEach((done) => {
        if (server) {
            done()
        }
    });

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

})
