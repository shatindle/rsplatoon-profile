const express = require("express");
const router = express.Router();
const databaseApi = require("../dal/databaseApi");
const appSettings = require("../../settings.json");

async function rootPage(req, res, next) {
    try {
        if (req.session.userId) {
            var userData = await databaseApi.getUserProfileByUserId(req.session.userId);
    
            res.json({
                id: req.session.userId,
                username: req.session.username,
                avatar: req.session.avatar,
                baseUrl: appSettings.baseUrl,
                loginUrl: appSettings.loginUrl, 
                friendCode: userData ? userData.friendCode : "",
                name: userData && userData.name ? userData.name : "",
                drip: userData && userData.drip && userData.drip !== "NONE" ? userData.drip : "",
                template: userData && userData.template ? userData.template : "",
                // card is not available on this page
                profileId: userData ? userData.id : ""
            });
            return;
        }
    
        res.json({
            id: "",
            username: "",
            avatar: "",
            baseUrl: appSettings.baseUrl,
            loginUrl: appSettings.loginUrl,
            friendCode: "",
            name: "",
            drip: "",
            profileId: ""
        });
    } catch (e) {
        next("Error loading page");
    }
}

router.get('/user', rootPage);

module.exports = router;