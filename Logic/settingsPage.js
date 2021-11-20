const express = require('express');
const path = require('path');
const databaseApi = require("../DAL/databaseApi");
const appSettings = require("../settings.json");

function isAdmin(userId) {
    return appSettings.admin.indexOf(userId) > -1;
}

async function settingsPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

    const botkey = await databaseApi.getUserBotByUserId(req.session.userId);

    const admin = isAdmin(req.session.userId);

    var allbots = [];
    
    if (admin) {
        allbots = await databaseApi.getAllBots();
    }

    res.render(path.join(__dirname, '../html/settings.html'), {
        id: req.session.userId,
        username: req.session.username,
        avatar: req.session.avatar,
        baseUrl: appSettings.baseUrl,
        loginUrl: appSettings.loginUrl, 
        profileId: userData ? userData.id : "",
        botKey: botkey ? botkey.id : "",
        botData: botkey ? botkey : {},
        isAdmin: admin,
        allbots: allbots
    });
    return;
}

async function updateKeyPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (isAdmin(req.session.userId)) {
        await databaseApi.saveBot(req.body.name, {
            getProfile: req.body.getProfile.length === 2 ? true : false,
            saveFriendCode: req.body.saveFriendCode.length === 2 ? true : false,
            saveUsername: req.body.saveUsername.length === 2 ? true : false,
            saveDrip: req.body.saveDrip.length === 2 ? true : false,
            deleteProfile: req.body.deleteProfile.length === 2 ? true : false
        }, false);
    }

    return res.redirect('/settings');
}

async function grantKeyPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (isAdmin(req.session.userId)) {
        await databaseApi.saveBot(req.body.name, {
            getProfile: req.body.permissions && req.body.permissions.indexOf("getProfile") > -1,
            saveFriendCode: req.body.permissions && req.body.permissions.indexOf("saveFriendCode") > -1,
            saveUsername: req.body.permissions && req.body.permissions.indexOf("saveUsername") > -1,
            saveDrip: req.body.permissions && req.body.permissions.indexOf("saveDrip") > -1,
            deleteProfile: req.body.permissions && req.body.permissions.indexOf("deleteProfile") > -1,
            nobot: false
        }, true);
    }

    return res.redirect('/settings');
}

async function resetKeyPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (isAdmin(req.session.userId) && req.body.name) {
        await databaseApi.saveBot(req.body.name, {
            nobot: false
        }, true);
    } else {
        const yourBot = await databaseApi.getUserBotByUserId(req.session.userId);

        if (yourBot && !yourBot.nobot) {
            await databaseApi.saveBot(req.session.userId, {}, true);
        }
    }

    return res.redirect('/settings');
}

async function revokeKeyPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (isAdmin(req.session.userId)) {
        await databaseApi.saveBot(req.body.name, {
            nobot: true
        }, false);
    }

    return res.redirect('/settings');
}

/**
 * @description Setup function for this route
 * @param {express.Express} app The express app
 */
 function init(app) {
    app.get('/settings', settingsPage);
    app.post('/settings/updatekey', updateKeyPage);
    app.post('/settings/grantkey', grantKeyPage);
    app.post('/settings/resetkey', resetKeyPage);
    app.post('/settings/revokekey', revokeKeyPage);
}

module.exports = {
    init
};