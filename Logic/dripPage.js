const express = require('express');
const path = require('path');
const appSettings = require("../settings.json");
const imgApi = require("../DAL/imgApi");
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage({}) });
const databaseApi = require("../DAL/databaseApi");
const cardApi = require("../DAL/cardApi");

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
        name: userData && userData.name ? userData.name : "User",
        drip: userData && userData.drip && userData.drip !== "NONE" ? userData.drip : "",
        blockupload: !await databaseApi.canUpdate(req.session.userId),
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
            await imgApi.createDrip(req.session.userId, req.file.buffer);

            const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

            // update user card
            const cardBuffer = await cardApi.createCard(req.file.buffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
            await imgApi.uploadCard(req.session.userId, cardBuffer);
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
 * @description User be deleting drip
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {Function} next The next function to run if this one has nothing to do
 */
async function deleteDrip(req, res, next) {
    try {
        if (!req.session.userId)
            return res.redirect('/');

            var userData = await databaseApi.getUserProfileByUserId(req.session.userId);

            if (userData && userData.dripDeleteHash) {
                const response = await imgApi.deleteImage(userData.dripDeleteHash);

                if (response.success)
                    await databaseApi.updateUserProfile(req.session.userId, {
                        drip: "NONE",
                        dripDeleteHash: "NONE"
                    });
                else
                    throw "Unable to delete drip";
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
    app.post('/drip/save', upload.single('drip'), postDrip);
    app.post('/drip/delete', deleteDrip);
}

module.exports = {
    init
};