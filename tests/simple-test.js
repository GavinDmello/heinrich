//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var request = require('supertest');
var config = require('../config.json')
var server = require('../main');
var should = chai.should();

//console.log('========',server)
//
//Our parent block
describe('basic tests', () => {
    beforeEach((done) => { //Before each test we empty the database
      if(server) {
        done()
      }
    });
/*
  * Test the /GET route
  */
  describe('test any route', () => {
      it('it should give some error as no servers are available', (done) => {
          request(server)
            .get('/hi')
            .expect(503, done)
      })
  })

})