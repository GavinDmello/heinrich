var analyticClass = require('./analysis')
var analytics = new analyticClass()
var mailerUtilty = require('./mailer')
var mailer = new mailerUtilty()
var config = require('../config.json')
var genericUtility = {}

module.exports = genericUtility

genericUtility.handleAction = function(data) {
    if (data.type === 'downtime') {
        // send down time mail
        mailer.sendDownTimeMail({ downServers: data.health.downServers })

    }

    if (data.type === 'reset') {
        mailer.resetFlag() // reset the flag for for further mailing info
    }

    analytics.send(data) // Any health related information should be relayed.
}
