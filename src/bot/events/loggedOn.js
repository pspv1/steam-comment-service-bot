/*
 * File: loggedOn.js
 * Project: steam-comment-service-bot
 * Created Date: 2021-07-09 16:26:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-02-10 14:08:02
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const { EPersonaState } = require("steam-user");

const Bot = require("../bot.js");


/**
 * Do some stuff when account is logged in
 */
Bot.prototype._attachSteamLoggedOnEvent = function() {

    this.user.on("loggedOn", () => {

        // Print message and set status to online
        logger("info", `[${this.logPrefix}] Account logged in! Waiting for websession...`, false, true, logger.animation("loading"));

        if (this.index == 0) {
            logger("debug", `[${this.logPrefix}] Setting online status '${this.data.advancedconfig.onlineStatus}' as enum '${EPersonaState[this.data.advancedconfig.onlineStatus]}'`);
            this.user.setPersona(EPersonaState[this.data.advancedconfig.onlineStatus]); // Set main bot online status
        } else {
            logger("debug", `[${this.logPrefix}] Setting online status '${this.data.advancedconfig.childAccOnlineStatus}' as enum '${EPersonaState[this.data.advancedconfig.childAccOnlineStatus]}'`);
            this.user.setPersona(EPersonaState[this.data.advancedconfig.childAccOnlineStatus]); // Set child acc online status
        }

        logger("debug", `[${this.logPrefix}] Public IP of this account: ${this.user.publicIP}`);


        // Increase progress bar if one is active
        if (logger.getProgressBar()) logger.increaseProgressBar((100 / this.data.logininfo.length) / 3);

    });

};
