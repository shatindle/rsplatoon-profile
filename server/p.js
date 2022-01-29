const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const databaseApi = require("./dal/databaseApi");
const path = require("path");
const { getProfile } = require("./logic/profileData");

async function profilePage(req, res, next) {
    try {
        if (req.session.isBot && req.session.getProfile) {
            if (req.query.userId) {
                var userData = await databaseApi.getUserProfileByUserId(req.query.userId);

                if (userData) {
                    // do they have a card?  If not, make one!
                    if (!userData.card || userData.card === "NONE") {
                        var dripBuffer;

                        if (userData.drip && userData.drip !== "NONE") {
                            const response = await fetch(userData.drip);
                            dripBuffer = Buffer.from(await response.arrayBuffer());
                        } else {
                            dripBuffer = await readFile(path.join(__dirname, "../../public/css/img/nodrip.png"));
                        }

                        // update user card
                        const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
                        await imgApi.uploadCard(req.query.userId, cardBuffer);
                    }
                }

                return res.json({
                    friendCode: userData ? userData.friendCode : "",
                    name: userData && userData.name ? userData.name : "User",
                    drip: userData && userData.drip && userData.drip !== "NONE" ? userData.drip : "",
                    card: userData && userData.card && userData.card !== "NONE" ? userData.card : "",
                    profileId: userData ? userData.id : ""
                });
            } else {
                return res.json({
                    result: "missing userId param"
                });
            }
        }

        if (req.params.id.length !== 36)
            throw "Invalid ID";

        const profile = await getProfile(req.params.id);

        if (!profile)
            throw "Profile not found";

        var responseData = {
            id: "",
            username: "",
            avatar: "",
            ...profile
        }

        if (req.session.userId) {
            responseData.id = req.session.userId;
            responseData.username = req.session.username;
            responseData.avatar = req.session.avatar;
        }

        res.render(path.join(__dirname, '/html/profile.html'), responseData);
    } catch (e) {
        next("Profile not found");
    }
}

router.get("/p(/:id)?", profilePage);

module.exports = router;