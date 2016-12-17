var Pfade = require('pfade')
var pfade = new Pfade()
var config = pfade.require('config.json')
var mailer
var analytics = config.analytics
var SocketServer = pfade.require('lib/socket-server')
var socketServer = new SocketServer()

if (config.reporting) {
    var mailerUtilty = pfade.require('utilities/mailer')
    mailer = new mailerUtilty()
}

var genericUtility = {}

module.exports = genericUtility

genericUtility.handleAction = function(data) {

    switch (data.type) {
        case 'downtime':
            // send down time mail
            if (mailer) {
                mailer.sendDownTimeMail({ downServers: data.health.downServers })
            }

            // send analytics
            if (analytics) {
                socketServer.sendHealthInfo(data)
            }
            break

        case 'reset':
            // reset the flag for for further mailing info
            if (mailer) {
                mailer.resetFlag()
            }

            // send analytics
            if (analytics) {
                socketServer.sendHealthInfo(data)
            }
            break

        case 'error':
            if (analytics) {
                socketServer.sendErrorInfo(data)
            }
            break

        case 'requests':
            if (analytics) {
                socketServer.sendRequestInfo(data)
            }
            break

        case 'connections':
            if (analytics) {
                socketServer.sendConnectionsInfo(data)
            }
            break

        case 'block':
            if (analytics) {
                socketServer.sendBlockedRequestInfo(data)
            }
            break
    }
}

genericUtility.decider = function(msg) {

    // parent process will directly send
    if (!process.send) {
        process.send = this.handleAction
    }

    // if message  has to be sent, it will be sent
    config.multiCore && process.env.NODE_ENV !== 'test' ? process.send(msg) : this.handleAction(msg)

}
