const express = require("express");
const router = express.Router();
const { logout } = require("./logic/login");

router.get('/', (req, res, next) => {
    try {
        logout(res);

        res.redirect('/');
    } catch (e) {
        next(e);
    }
});

module.exports = router;