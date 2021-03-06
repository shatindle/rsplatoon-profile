const express = require("express");
const router = express.Router();
const path = require('path');
const databaseApi = require("../../dal/databaseApi");
const appSettings = require("../../../settings.json");

function isAdmin(userId) {
    return appSettings.admin.indexOf(userId) > -1;
}

async function settingsPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

    const botkey = await databaseApi.getUserBotByUserId(req.session.userId);

    const webhooks = await databaseApi.loadTeamWebhooks();

    const admin = isAdmin(req.session.userId);

    var allbots = [];
    
    if (admin) {
        allbots = await databaseApi.getAllBots();
    }

    res.json({
        id: req.session.userId,
        username: req.session.username,
        avatar: req.session.avatar,
        baseUrl: appSettings.baseUrl,
        loginUrl: appSettings.loginUrl, 
        profileId: userData ? userData.id : "",
        botKey: botkey ? botkey.id : "",
        teamWebhookAllowed: botkey ? botkey.teamWebhook : false,
        teamWebhookUrl: botkey && botkey.teamWebhook && webhooks[req.session.userId] ? webhooks[req.session.userId] : "",
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
        await databaseApi.saveBot(req.body.userId, {
            getProfile: req.body.getProfile ?? false,
            saveFriendCode: req.body.saveFriendCode ?? false,
            saveUsername: req.body.saveUsername ?? false,
            saveDrip: req.body.saveDrip ?? false,
            deleteProfile: req.body.deleteProfile ?? false,
            teamWebhook: req.body.teamWebhook ?? false,
            teamQuery: req.body.teamQuery ?? false
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
            teamWebhook: req.body.permissions && req.body.permissions.indexOf("teamWebhook") > -1,
            teamQuery: req.body.permissions && req.body.permissions.indexOf("teamQuery") > -1,
            nobot: false
        }, true);
    }

    return res.redirect('/settings');
}

async function resetKeyPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (isAdmin(req.session.userId) && req.body.userId) {
        await databaseApi.saveBot(req.body.userId, {
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
        await databaseApi.saveBot(req.body.userId, {
            nobot: true
        }, false);
    }

    return res.redirect('/settings');
}

async function setTeamWebhook(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    const botkey = await databaseApi.getUserBotByUserId(req.session.userId);

    if (botkey.teamWebhook) {
        if (req.body.webhook) {
            let url;
            
            try {
                url = new URL(req.body.webhook);
                await databaseApi.saveTeamWebhook(req.session.userId, req.body.webhook);
            } catch (_) {
                return false;  
            }
            
        } else {
            await databaseApi.deleteTeamWebhook(req.session.userId);
        }

        return res.redirect('/settings');
    }
}

router.get('/', settingsPage);
router.post('/updatekey', express.json(), updateKeyPage);
router.post('/grantkey', grantKeyPage);
router.post('/resetkey', express.json(), resetKeyPage);
router.post('/revokekey', express.json(), revokeKeyPage);
router.post('/saveteamwebhook', setTeamWebhook);

module.exports = router;