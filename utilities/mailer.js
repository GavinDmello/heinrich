var Pfade = require('pfade')
var pfade = new Pfade()
var config = pfade.require('config')
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
var async = require('async')
var nextTick = process.nextTick
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var serverOptions = {}
var smtpConfig = config.reporting
var mailSent = false
var nextTick = process.nextTick

function mailer() {}

if (!smtpConfig.user || !smtpConfig.pass) {
    throw new Error("Email or password not provided")
    return
}

if (smtpConfig.receipients.length === 0) {
    throw new Error('No receipients provided')
    return
}

if (smtpConfig.secure) {
    serverOptions = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        }
    }
} else {
    serverOptions = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure
    }
}

var smtpTransport = nodemailer.createTransport(smtpTransport(serverOptions))

mailer.prototype.sendDownTimeMail = function(params) {
    if (mailSent) {
        return
    }
    mailSent = true
    smtpTransport.sendMail({
        from: config.reporting.email,
        to: config.reporting.receipients,
        subject: "Server Down",
        text: this.getText(params.downServers)
    }, function(error, response) {
        if (error) {
            logger.error(error)

        } else {
            that = null
        }
    })

}

mailer.prototype.getText = function(servers) {
    var serverString = "The following server(s) went down \n"
    for (var i = 0; i < servers.length; i++) {
        serverString += "host : " + servers[i].host + " port: " + servers[i].port + '\n'
    }
    serverString += "The following message was sent by heinrich"
    return serverString
}

mailer.prototype.resetFlag = function() {
    mailSent = false
}

mailer.prototype.handleAction = function(msg) {
    console.log(this)
    if (msg.type === 'downtime') {
        that.sendDownTimeMail({ downServers: msg.health.downServers })
    }
    if (msg.type === 'reset') {
        this.resetFlag()
    }
}

mailer.prototype.close = function() {
    smtpTransport.close()
}

module.exports = mailer
