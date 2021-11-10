const express = require('express');
const url = require('url');
const fetch = require('node-fetch');
const discordCredentials = require("../discord.json");

/**
 * @description Login to Discord callback
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {Function} next The next function to run if this one has nothing to do
 */
async function discordLoginPage (req, res, next) {
    try {
        const urlObj = url.parse(req.url, true);

        if (urlObj.query.code) {
            const accessCode = urlObj.query.code;
            const data = {
                client_id: discordCredentials.client_id,
                client_secret: discordCredentials.client_secret,
                grant_type: 'authorization_code',
                redirect_uri: discordCredentials.redirect_uri,
                code: accessCode,
                scope: 'identify',
            };

            var response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            var info = await response.json();

            var userInfoRequest = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${info.token_type} ${info.access_token}`,
                },
            });    

            var userData = await userInfoRequest.json();

            req.session.userId = userData.id;
            req.session.username = userData.username + "#" + userData.discriminator;
            req.session.createdon = userData.id;

            if (userData.avatar) {
                req.session.avatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`;
            } else {
                req.session.avatar = `/css/img/discord.png`;
            }

            // databaseApi.recordLogin(userData.id);
        }

        res.redirect('/');
    } catch (e) {
        next("Error logging in");
    }
}

/**
 * @description Setup function for this route
 * @param {Express} app The express app
 */
function init(app) {
    app.get('/discordlogin', discordLoginPage);
}

module.exports = {
    init
};