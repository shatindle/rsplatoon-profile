const express = require("express");
const router = express.Router();
const databaseApi = require("../dal/databaseApi");
const fetch = require("node-fetch");
const cardApi = require("../dal/cardApi");
const imgApi = require("../dal/imgApi");

function cleanFriendCode(friendcode) {
    friendcode = friendcode.replace(/(\r\n|\n|\r)/gm, "");
    friendcode = friendcode.replace(/\D/g,'');
    let tempfriendcode = "";
    // 0123-4567-8901
    for (var i = 0; i < friendcode.length; i++) {
        tempfriendcode += friendcode[i];
        if (i === 3 || i === 7)
            tempfriendcode += "-";
    }
    return tempfriendcode;
}

async function savePage(req, res, next) {
    try {
        if (req.session.userId) {
            if (!await databaseApi.canUpdate(req.session.userId))
                throw "Update limit has been reached for this user";

            if (req.body.friendcode || req.body.name || req.body.template || req.body.version) {
                if (req.body.friendcode) {
                    // validate friend code
                    req.body.friendcode = cleanFriendCode(req.body.friendcode);
                    if (!req.body.friendcode.match(/^[0-9]{4}\-[0-9]{4}\-[0-9]{4}$/)) {
                        throw "Invalid friend code";
                    }
                }

                if (req.body.name && req.body.name.length > 10) {
                    req.body.name = req.body.name.substring(0, 10);
                }

                await databaseApi.updateUserProfile(req.session.userId, {
                    friendCode: req.body.friendcode,
                    name: req.body.name,
                    template: req.body.template
                }, req.body.version);

                var userData = await databaseApi.getUserProfileByUserId(req.session.userId);

                var dripBuffer;

                if (userData.drip && userData.drip !== "NONE") {
                    const response = await fetch(userData.drip);
                    dripBuffer = Buffer.from(await response.arrayBuffer());
                } else {
                    dripBuffer = await readFile(path.join(__dirname, "../../public/css/img/nodrip.png"));
                }

                // update user card
                const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
                await imgApi.uploadCard(req.session.userId, cardBuffer);
            }
        } else if (req.session.isBot) {
            if (req.body.userId) {
                if (!await databaseApi.canUpdate(req.body.userId))
                    throw "Update limit has been reached for this user";

                if (
                    (req.body.friendcode && req.session.saveFriendCode) || 
                    (req.body.name && req.session.saveUsername) || 
                    (req.body.template && req.session.saveDrip)
                ) {
                    if (req.body.friendcode) {
                        // validate friend code
                        req.body.friendcode = cleanFriendCode(req.body.friendcode);
                        if (!req.body.friendcode.match(/^[0-9]{4}\-[0-9]{4}\-[0-9]{4}$/)) {
                            return res.send({
                                result: "Invalid friend code"
                            });
                        }
                    }

                    if (req.body.name && req.body.name.length > 10) {
                        req.body.name = req.body.name.substring(0, 10);
                    }
    
                    await databaseApi.updateUserProfile(req.body.userId, {
                        friendCode: req.session.saveFriendCode ? req.body.friendcode : null,
                        name: req.session.saveUsername ? req.body.name : null,
                        template: req.session.saveDrip ? req.body.template : null
                    }, false);

                    var userData = await databaseApi.getUserProfileByUserId(req.body.userId);

                    var dripBuffer;

                    if (userData.drip && userData.drip !== "NONE") {
                        const response = await fetch(userData.drip);
                        dripBuffer = Buffer.from(await response.arrayBuffer());
                    } else {
                        dripBuffer = await readFile(path.join(__dirname, "css/img/nodrip.png"));
                    }

                    // update user card
                    const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
                    await imgApi.uploadCard(req.body.userId, cardBuffer);
    
                    return res.json({
                        result: "updated"
                    });
                }
    
                return res.json({
                    result: "unable to update friend code"
                });
            } else {
                return res.json({
                    result: "missing userId param"
                });
            }
        }
    
        res.redirect("/?_v=" + new Date().valueOf(), 302);
    } catch (e) {
        next("Invalid data");
    }
}

router.post('/save', savePage);

module.exports = router;