function logger() {}

module.exports = logger

logger.prototype.log = function() {
    if (process.env.NODE_ENV !== 'test') {
        console.log(new Date().toLocaleString(), arguments)
    }
}

logger.prototype.error = function() {
    console.log(new Date().toLocaleString(), arguments)
}
