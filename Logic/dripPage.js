const express = require('express');
const path = require('path');
const appSettings = require("../settings.json");
const imgApi = require("../DAL/imgApi");
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage({}) });
const databaseApi = require("../DAL/databaseApi");

/**
 * @description Get the drip page for managing your drip
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {Function} next The next function to run if this one has nothing to do
 */
async function getPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    var userData = await databaseApi.getUserProfileByUserId(req.session.userId);

    res.render(path.join(__dirname, '../html/drip.html'), {
        id: req.session.userId,
        username: req.session.username,
        avatar: req.session.avatar,
        baseUrl: appSettings.baseUrl,
        loginUrl: appSettings.loginUrl, 
        friendCode: userData ? userData.friendCode : "",
        drip: userData ? userData.drip : "",
        blockupload: !await databaseApi.canUpload(req.session.userId),
        profileId: userData ? userData.id : ""
    });
    return;
}

/**
 * @description User be posting drip
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {Function} next The next function to run if this one has nothing to do
 */
async function postDrip(req, res, next) {
    try {
        if (!req.session.userId)
            return res.redirect('/');

        if (req.file) {
            if (await databaseApi.canUpload(req.session.userId)) {
                await databaseApi.updateUserProfile(req.session.userId, {
                    uploadAttempt: true
                });

                const response = await imgApi.uploadImage(req.file.buffer);

                await databaseApi.updateUserProfile(req.session.userId, {
                    drip: response.url,
                    dripDeleteHash: response.deleteHash
                });
            }
        }
    } catch (err) {
        return res.send({
            body: "error",
            status: 500
        });
    }

    res.redirect('/drip');
}

/**
 * @description Setup function for this route
 * @param {Express} app The express app
 */
 function init(app) {
    app.get('/drip', getPage);
    app.post('/drip', upload.single('drip'), postDrip);
}

module.exports = {
    init
};