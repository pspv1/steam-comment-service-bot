
/**
 * Runs the abort command
 * @param {Function} chatmsg The chatmsg function
 * @param {Object} steamID The steamID object from steam-user
 * @param {Object} lang The language object
 * @param {Number} steam64id The steam64id of the requesting user
 */
module.exports.abort = (chatmsg, steamID, lang, steam64id) => {
    var mainfile = require("../../main.js")

    if (!mainfile.activecommentprocess[steam64id] || mainfile.activecommentprocess[steam64id].status != "active") return chatmsg(steamID, lang.abortcmdnoprocess)

    mainfile.activecommentprocess[steam64id].status = "aborted"

    logger("info", `Aborting comment process for profile ${steam64id}...`)
    chatmsg(steamID, lang.abortcmdsuccess)
}


/**
 * Runs the resetcooldown command
 * @param {Function} chatmsg The chatmsg function
 * @param {Object} steamID The steamID object from steam-user
 * @param {Object} lang The language object
 * @param {Array} args The args array
 * @param {Number} steam64id The steam64id of the requesting user
 */
module.exports.resetCooldown = (chatmsg, steamID, lang, args, steam64id) => {
    var SteamID    = require("steamid")

    var mainfile   = require("../../main.js")
    var controller = require("../../../controller/controller.js")

    if (config.commentcooldown == 0) return chatmsg(steamID, lang.resetcooldowncmdcooldowndisabled) //is the cooldown enabled?

    if (args[0]) {
        if (args[0] == "global") { //Check if user wants to reset the global cooldown (will reset all until entries in activecommentprocess)
            Object.keys(mainfile.activecommentprocess).forEach((e) => {
                mainfile.activecommentprocess[e].until = Date.now() - (config.globalcommentcooldown * 60000); //since the cooldown checks will add the cooldown we need to subtract it (can't delete the entry because we might abort running processes with it)
            })

            return chatmsg(steamID, lang.resetcooldowncmdglobalreset) 
        }

        if (isNaN(args[0])) return chatmsg(steamID, lang.invalidprofileid) 
        if (new SteamID(args[0]).isValid() === false) return chatmsg(steamID, lang.invalidprofileid) 

        var steam64id = args[0] //change steam64id to the provided id
    }

    controller.lastcomment.update({ id: steam64id }, { $set: { time: Date.now() - (config.commentcooldown * 60000) } }, (err) => { 
        if (err) return chatmsg(steamID, "Error updating database entry: " + err)
            else chatmsg(steamID, lang.resetcooldowncmdsuccess.replace("profileid", steam64id.toString())) 
    })
}


/**
 * Runs the failed command
 * @param {Function} chatmsg The chatmsg function
 * @param {Object} steamID The steamID object from steam-user
 * @param {Object} lang The language object
 * @param {Number} steam64id The steam64id of the requesting user
 */
module.exports.failed = (chatmsg, steamID, lang, steam64id) => {
    var mainfile   = require("../../main.js")
    var controller = require("../../../controller/controller.js")
    
    controller.lastcomment.findOne({ id: steam64id }, (err, doc) => {
        if (!mainfile.failedcomments[steam64id] || Object.keys(mainfile.failedcomments[steam64id]).length < 1) return chatmsg(steamID, lang.failedcmdnothingfound);

        chatmsg(steamID, lang.failedcmdmsg.replace("steam64id", steam64id).replace("requesttime", new Date(doc.time).toISOString().replace(/T/, ' ').replace(/\..+/, '')) + "\n\n" + JSON.stringify(mainfile.failedcomments[steam64id], null, 4))
    })
}


/**
 * Runs the sessions command
 * @param {Function} chatmsg The chatmsg function
 * @param {Object} steamID The steamID object from steam-user
 * @param {Object} lang The language object
 */
module.exports.sessions = (chatmsg, steamID, lang) => {
    var mainfile = require("../../main.js")
    var str      = "";

    if (Object.keys(mainfile.activecommentprocess).length > 0) { //Only loop through object if it isn't empty
        let objlength = Object.keys(mainfile.activecommentprocess).length //save this before the loop as deleting entries will change this number and lead to the loop finished check never triggering

        Object.keys(mainfile.activecommentprocess).forEach((e, i) => {

            if (Date.now() < mainfile.activecommentprocess[e].until + (config.globalcommentcooldown * 60000)) { //check if entry is not finished yet

                str += `- Status: ${mainfile.activecommentprocess[e].status} | ${mainfile.activecommentprocess[e].amount} comments with ${mainfile.activecommentprocess[e].accounts.length} accounts by ${mainfile.activecommentprocess[e].requestedby} for ${mainfile.activecommentprocess[e].type} ${Object.keys(mainfile.activecommentprocess)[i]}`
            } else {
                delete mainfile.activecommentprocess[e] //remove entry from object if it is finished to keep the object clean
            }

            if (i == objlength - 1) {
                chatmsg(steamID, lang.sessionscmdmsg.replace("amount", Object.keys(mainfile.activecommentprocess).length) + "\n" + str)
            }
        })
    } else {
        chatmsg(steamID, lang.sessionscmdnosessions);
    }
}


/**
 * Runs the mysessions command
 * @param {Function} chatmsg The chatmsg function
 * @param {Object} steamID The steamID object from steam-user
 * @param {Object} lang The language object
 * @param {Number} steam64id The steam64id of the requesting user
 */
module.exports.mysessions = (chatmsg, steamID, lang, steam64id) => {
    var mainfile = require("../../main.js")
    var str      = ""

    if (Object.keys(mainfile.activecommentprocess).length > 0) { //Only loop through object if it isn't empty
        let objlength = Object.keys(mainfile.activecommentprocess).length //save this before the loop as deleting entries will change this number and lead to the loop finished check never triggering

        Object.keys(mainfile.activecommentprocess).forEach((e, i) => {

            if (Date.now() < mainfile.activecommentprocess[e].until + (config.globalcommentcooldown * 60000)) { //check if entry is not finished yet

                if (mainfile.activecommentprocess[e].requestedby == steam64id) str += `- Status: ${mainfile.activecommentprocess[e].status} | ${mainfile.activecommentprocess[e].amount} comments with ${mainfile.activecommentprocess[e].accounts.length} accounts by ${mainfile.activecommentprocess[e].requestedby} for ${mainfile.activecommentprocess[e].type} ${Object.keys(mainfile.activecommentprocess)[i]}`
            } else {
                delete mainfile.activecommentprocess[e] //remove entry from object if it is finished to keep the object clean
            }

            if (i == objlength - 1) {
                chatmsg(steamID, lang.sessionscmdmsg.replace("amount", Object.keys(mainfile.activecommentprocess).length) + "\n" + str)
            }
        })
    } else {
        chatmsg(steamID, lang.mysessionscmdnosessions);
    }
}