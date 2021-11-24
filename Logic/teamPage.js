const express = require('express');
const path = require('path');
const databaseApi = require("../DAL/databaseApi");
const appSettings = require("../settings.json");
const discordApi = require("../DAL/discordApi");

/**
 * @description View your team or register a team
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function teamPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

    const tournamentTeam = await databaseApi.getTournamentTeam(req.session.userId);

    var teamData = null;

    if (tournamentTeam) {
        teamData = {
            name: tournamentTeam.name,
            captain: tournamentTeam.captain,
            team: []
        };

        for (var i = 0; i < tournamentTeam.team.length; i++) {
            var user = await discordApi.getUserById(tournamentTeam.team[i]);

            teamData.team.push({
                userId: user.id,
                name: user.name,
                avatar: user.avatar
            });

            if (user.id === tournamentTeam.captain)
                teamData.captain = user.name;
        }

        
    }

    res.render(path.join(__dirname, '../html/tournamentTeam.html'), {
        id: req.session.userId,
        username: req.session.username,
        avatar: req.session.avatar,
        baseUrl: appSettings.baseUrl,
        loginUrl: appSettings.loginUrl, 
        profileId: userData ? userData.id : "",
        tournamentTeam: teamData
    });
    return;
}

async function lookupUser(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (!req.query.search)
        return res.send([]);

    var user = await discordApi.getUserById(req.query.search);

    var result;

    if (user === "unknown") {
        result = await discordApi.findUserByName(req.query.search);
    } else {
        result = [user];
    }

    res.send(result);
}

async function lookupTeam(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');
}

/**
 * @description Register your team, declaring yourself as team captain
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function registerPage(req, res, next) {
    if (req.body.team && req.body.name) {
        var team = req.body.team.filter(n => n);
        var captain = req.session.userId;

        // add the current user as team captain
        team.unshift(captain);

        if (team.length > 6 || team.length < 4)
            return res.status(500).send({ error: "incorrect team count" });

        await databaseApi.saveTournamentTeam(req.session.userId, team, req.session.userId, req.body.name);
    }

    return res.redirect('/team');
}

/**
 * @description Leave your current team
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function leavePage(req, res, next) {

}

/**
 * @description Update your team members (you must be team captain)
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function updatePage(req, res, next) {

}

/**
 * @description Update your team members (you must be team captain)
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function deletePage(req, res, next) {

}

/**
 * @description Setup function for this route
 * @param {express.Express} app The express app
 */
 function init(app) {
    app.get('/team', teamPage);
    app.get('/team/find/user', lookupUser);
    app.get('/team/find/team', lookupTeam);
    app.post('/team/register', registerPage);
    app.post('/team/leave', leavePage);
    app.post('/team/update', updatePage);
    app.post('/team/delete', deletePage);
}

module.exports = {
    init
};