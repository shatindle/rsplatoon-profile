const express = require("express");
const router = express.Router();
const databaseApi = require("../dal/databaseApi");

async function deletePage(req, res, next) {
    try {
        if (req.session.userId) {
            if (req.body.delete === "YES") {
                await databaseApi.removeUserProfile(req.session.userId);
            }
        }
        
        res.redirect("/?_v=" + new Date().valueOf(), 302);
    } catch (e) {
        next("Error performing operation");
    }
}

router.post("/delete", deletePage);

module.exports = router;