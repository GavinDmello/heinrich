//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var request = require('supertest');
var server = require('../main');
var should = chai.should();

describe('simple tests', () => {
    beforeEach((done) => {
        if (server) {
            done()
        }
    });

    describe('test any route', () => {

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

})
