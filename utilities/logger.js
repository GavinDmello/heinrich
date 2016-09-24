function logger() {}

module.exports = logger

logger.prototype.log = function() {
    console.log(new Date().toLocaleString(), arguments)
}

logger.prototype.error = function(){
    console.log(new Date().toLocaleString(), arguments)
}