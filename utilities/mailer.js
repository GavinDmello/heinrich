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
var emailSent = {}

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
    var mailMessage = this.getText(params.downServers)

    if (!mailMessage) {
        return
    }

    smtpTransport.sendMail({
        from: config.reporting.email,
        to: config.reporting.receipients,
        subject: "Server Down",
        text: mailMessage
    }, smtpTransportResponse)

    function smtpTransportResponse(error, response) {
        if (error) {
            logger.error(error)

        }
    }

}

mailer.prototype.getText = function(servers) {
    var flag = false
    var serverString = "The following server(s) went down \n"

    for (var i = 0; i < servers.length; i++) {

        if (!emailSent[servers[i].host + servers[i].port]) {
            serverString += "host : " + servers[i].host + " port: " + servers[i].port + '\n'
            emailSent[servers[i].host + servers[i].port] = true
            flag = true
        }
    }
    serverString += "The following message was sent by heinrich"
    return flag ? serverString : undefined
}

mailer.prototype.resetFlag = function() {
    var serverKeys = Object.keys(emailSent)
    for (var i = 0; i < serverKeys.length; i++) {

        if (emailSent[serverKeys[i]]) {
            emailSent[serverKeys[i]] = false
        }
    }
}

mailer.prototype.close = function() {
    smtpTransport.close()
}

module.exports = mailer
