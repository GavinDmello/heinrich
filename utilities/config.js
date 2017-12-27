/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade()
var config = pfade.require('config.json')
var extend = require("xtend")

var Conf = {
    "port": 8090,
    "pingInterval": 1000,
    "servers": [{
            "host": "127.0.0.1",
            "port": 8090
        },
        {
            "host": "127.0.0.1",
            "port": 9000
        }
    ],
    "mode": 1,
    "blackListAddress": [],
    "blockedUserAgent": [],
    "requestTimeout": 10,
    "https": false,
    "multiCore": false,
    "key": "",
    "cert": ""
}
console.trace()
console.log(Conf, config)
module.exports = extend(Conf, config || {})