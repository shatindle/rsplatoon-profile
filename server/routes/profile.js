const express = require("express");
const router = express.Router();
const { getProfile } = require("../logic/profileData");

router.get("/profile/:id", async (req, res) => {
    const data = await getProfile(req.params.id);

    res.json(data);
});

module.exports = router;