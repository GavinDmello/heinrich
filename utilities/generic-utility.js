var Pfade = require('pfade')
var pfade = new Pfade()
var config = pfade.require('config.json')
var analytics, mailer
if (config.analytics) {
    var analyticClass = pfade.require('utilities/analysis')
    analytics = new analyticClass()
}

if (config.reporting) {
    var mailerUtilty = pfade.require('utilities/mailer')
    mailer = new mailerUtilty()
}

var genericUtility = {}

module.exports = genericUtility

genericUtility.handleAction = function(data) {
    if (mailer && data.type === 'downtime') {
        // send down time mail
        mailer.sendDownTimeMail({ downServers: data.health.downServers })

    }

    if (mailer && data.type === 'reset') {
        mailer.resetFlag() // reset the flag for for further mailing info
    }

    // Any health related information should be relayed.
    if (analytics) analytics.send(data)

}
