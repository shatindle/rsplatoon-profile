const express = require("express");
const router = express.Router();
const path = require('path');
const appSettings = require("../../../settings.json");
const imgApi = require("../../dal/imgApi");
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage({}) });
const databaseApi = require("../../dal/databaseApi");
const cardApi = require("../../dal/cardApi");
const fetch = require("node-fetch");

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

    res.json({
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
    // TODO: figure out a way to re-enable this once we have an alternative to the nsfw API
    return res.status(500).send({
        body: "error"
    });

    try {
        if (!req.session.userId)
            return res.redirect('/');

        if (req.file) {
            await imgApi.createDrip(req.session.userId, req.file.buffer);

            const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

            var dripBuffer;

            if (userData.drip && userData.drip !== "NONE") {
                const response = await fetch(userData.drip);
                dripBuffer = Buffer.from(await response.arrayBuffer());
            } else {
                dripBuffer = await readFile(path.join(__dirname, "../css/img/nodrip.png"));
            }

            // update user card
            const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
            await imgApi.uploadCard(req.session.userId, cardBuffer);
        }
    } catch (err) {
        return res.status(500).send({
            body: "error"
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

router.get('/', getPage);
router.post('/save', upload.single('drip'), postDrip);
router.post('/delete', deleteDrip);

module.exports = router;