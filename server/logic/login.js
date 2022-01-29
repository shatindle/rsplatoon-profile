const express = require('express');
const jwt = require("jsonwebtoken");
const appSettings = require("../../settings.json");
const databaseApi = require("../dal/databaseApi");

const COOKIE_NAME = "rs_access_token";
const VALID_DAYS = 14 * 24 * 60 * 60 * 1000;
const REFRESH_DAYS = 7 * 24 * 60 * 60 * 1000;
const MAX_DAYS = 90 * 24 * 60 * 60 * 1000;
const COOKIE_DAYS = VALID_DAYS - 30 * 60 * 1000;

/**
 * @description Starts a session
 * @param {express.Request} req The request object
 * @param {express.Response} res The response we'll set the cookie on.  If null, return the token
 * @param {String} userId The user ID
 * @param {String} username The username
 * @param {String} createdOn The epoch date the user was created on
 * @param {String} avatar The avatar URL
 */
function startSession(req, res, userId, username, createdOn, avatar) {
    const now = Date.now();

    req.session.userId = userId;
    req.session.username = username;
    req.session.createdOn = createdOn;
    req.session.avatar = avatar;

    const token = jwt.sign({
        userId: userId,
        username: username,
        createdOn: createdOn,
        avatar: avatar,
        valid: new Date(now.valueOf() + VALID_DAYS).valueOf(),
        refresh: new Date(now.valueOf() + REFRESH_DAYS).valueOf(),
        max: new Date(now.valueOf() + MAX_DAYS).valueOf()
    }, appSettings.secret);

    res.cookie(COOKIE_NAME, token, {
        path: '/', 
        secure: appSettings.secureCookie, 
        httpOnly: true,
        domain: appSettings.cookieLocation,
        maxAge: COOKIE_DAYS // 14 days minus 30 minutes
    });
}

/**
 * @description Looks for a user cookie
 * @param {express.Request} req The request object
 * @returns {Boolean} Whether or not this is a previously logged in user
 */
function hasUserCookie(req) {
    if (req.cookies[COOKIE_NAME])
        return true;
    
    return false;
}

/**
 * @description Looks for a bot key in the header
 * @param {express.Request} req The request object
 * @returns {Boolean} Whether or not this is a bot login attempt
 */
function hasApiKey(req) {
    if (req.header(appSettings.apiKeyName))
        return true;

    return false;
}

/**
 * @description Refresh the token
 * @param {Date} now The current date
 * @param {Object} data The data to check
 * @param {express.Response} res The response object we'll set a cookie on if necessary
 */
function refresh(now, data, res) {
    try {
        if (now.valueOf() > data.refresh && now < data.max) {
            // due for a refresh
            data.valid =  new Date(now + VALID_DAYS).valueOf();

            if (data.valid > data.max)
                data.valid = data.max;

            data.refresh = new Date(now + REFRESH_DAYS).valueOf();

            if (data.refresh > data.max)
                data.refresh = data.max;

            const token = jwt.sign(data, appSettings.secret);

            res.cookie(COOKIE_NAME, token, {
                path: '/', 
                secure: appSettings.secureCookie, 
                httpOnly: true,
                domain: appSettings.cookieLocation,
                maxAge: COOKIE_DAYS // 14 days minus 30 minutes
            });
        }
    } catch {
        // token is invalid
    }
}

/**
 * @description Looks for an existing session in the request
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @returns {Boolean} Whether or not login was successful
 */
function login(req, res) {
    if (req.cookies[COOKIE_NAME]) {
        const current_token = req.cookies[COOKIE_NAME];
        const now = Date.now();

        try {
            const data = jwt.verify(current_token, appSettings.secret);

            if (now.valueOf() < data.valid) {
                refresh(now, data, res);

                if (!req.session)
                    req.session = {};

                req.session.userId = data.userId;
                req.session.username = data.username;
                req.session.createdOn = data.createdOn;
                req.session.avatar = data.avatar;

                return true;
            } else {
                logout(res);
                return false;
            }
        } catch {
            // login failed
            logout(res);
            return false;
        }
    }

    return false;
}

/**
 * @description Attempts to validate the bot token
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @returns {Boolean} Whether or not login was successful
 */
async function botTokenLogin(req, res) {
    try {
        const id = req.header(appSettings.apiKeyName);

        if (id) {
            const bot = await databaseApi.getBot(id);

            if (bot && !bot.nobot) {
                // valid bot found
                req.session.isBot = true;
                req.session.getProfile = bot.getProfile;
                req.session.saveFriendCode = bot.saveFriendCode;
                req.session.saveUsername = bot.saveUsername;
                req.session.saveDrip = bot.saveDrip;
                req.session.deleteProfile = bot.deleteProfile;

                // tournament roles
                req.session.teamWebhook = bot.teamWebhook;
                req.session.teamQuery = bot.teamQuery;

                return true;
            }
        }
    } catch (err) {
        // something when wrong during the authentication process
        console.log(err);
    }

    return false;
}

/**
 * @description Log the user out
 * @param {express.Response} res Delete the session cookie
 */
function logout(res) {
    res.clearCookie(COOKIE_NAME);
}

module.exports = {
    login,
    logout,
    startSession,
    botTokenLogin,
    hasUserCookie,
    hasApiKey
}