/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var helper = {}

helper.getRootPath = function(path) {
    var currentDir = path.split('/')
    currentDir.pop()
    return currentDir.join('/')
}

module.exports = helper
