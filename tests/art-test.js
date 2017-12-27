/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var showArt = require('../lib/art')
var chai = require('chai')
var expect = chai.expect

describe('art test', () => {

    it('should return text', (done) => {
        showArt((text) => {
            expect(text).to.be.string
            done()
        })
    })

})
