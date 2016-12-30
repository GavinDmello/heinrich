/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var fs = require('fs')

function logger() {
    this.directoryCheck = false
}

module.exports = logger

logger.prototype.log = function() {
    if (process.env.NODE_ENV !== 'test') {
        console.log(new Date().toLocaleString(), arguments)
        // this.logToFile('info', arguments)
    }
}

logger.prototype.error = function() {
    console.log(new Date().toLocaleString(), arguments)
    // this.logToFile('error', arguments)
}

logger.prototype.logToFile = function(type, arguments) {
    var logPath = '/var/log/heinrich'
    var dataToBeLogged = new Date().toLocaleString() + ' ' + JSON.stringify(arguments) + '\n'
    var filePath = logPath + '/' + type + '.log'
    if (!this.directoryCheck) {
        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath);
            this.directoryCheck = true
        }
        fs.appendFile(filePath, dataToBeLogged, noop)
    }
}

function noop() {}