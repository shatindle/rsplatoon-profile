const express = require('express');
const path = require('path');
const databaseApi = require("../DAL/databaseApi");
const appSettings = require("../settings.json");
const discordApi = require("../DAL/discordApi");
const mee6Api = require("../DAL/mee6Api");

/**
 * @description View your team or register a team
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function teamPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    await basePage(req, res, next);
}

async function basePage(req, res, next) {
    const userData = await databaseApi.getUserProfileByUserId(req.session.userId);

    const tournamentTeam = await databaseApi.getTournamentTeam(req.session.userId);

    var teamData = null;

    if (tournamentTeam) {
        teamData = {
            name: tournamentTeam.name,
            captain: tournamentTeam.captain,
            team: [],
            tournament: tournamentTeam.tournament
        };

        for (var i = 0; i < tournamentTeam.team.length; i++) {
            var user = await discordApi.getUserById(tournamentTeam.team[i]);

            teamData.team.push({
                userId: user.id,
                name: user.name,
                avatar: user.avatar ? user.avatar : "/css/img/discord.png"
            });

            if (user.id === tournamentTeam.captain)
                teamData.captain = user.name;
        }

        
    }

    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

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

    try {
        if (user === "unknown") {
            result = await discordApi.findUserByName(req.query.search);
    
            if (result.length === 0) {
                // search other user repos
                if (appSettings.otherServers && appSettings.otherServers.length) {
                    for (var i = 0; i < appSettings.otherServers.length; i++) {
                        var otherServer = appSettings.otherServers[i];
                        result = await mee6Api.searchUserList(otherServer, req.query.search);
    
                        if (result && result.length > 0) 
                            break;
                    }
                }
            }
        } else {
            result = [user];
        }
    } catch (err) {
        console.log("ERROR: " + err);

        result = [];
    }

    if (result.length !== 1) {
        result = [];
        res.send(result);
    } else {
        // verify the user is not on a team yet
        if (await databaseApi.validateTournamentUser(result[0].id)) {
            if (!result[0].avatar)
                result[0].avatar = "/css/img/discord.png";
                
            res.send(result);
        } else {
            res.send(result[0].name + " is already on a team");
        }
    }    
}

async function lookupTeam(req, res, next) {
    if (req.session.userId) {

    } else if (req.session.isBot && req.session.teamQuery) {
        const data = await databaseApi.getAllTournamentTeams(req.query.tournament);

        res.send(data);
        return;
    }

    return res.redirect('/');
}

/**
 * @description Register your team, declaring yourself as team captain
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function registerPage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    if (req.body.team) {
        var team = req.body.team.filter(n => n && n !== req.session.userId);
        var captain = req.session.userId;

        // add the current user as team captain
        team.unshift(captain);

        if (team.length > 6 || team.length < 4)
            return res.status(500).send({ error: "incorrect team count" });

        await databaseApi.saveTournamentTeam(req.session.userId, team, req.session.userId, req.body.name, req.body.tournament);
    }

    await basePage(req, res, next);
}

/**
 * @description Leave your current team
 * @param {express.Request} req The request object
 * @param {express.Response} res The response object
 * @param {express.NextFunction} next The next function to run if this one has nothing to do
 */
async function leavePage(req, res, next) {
    if (!req.session.userId)
        return res.redirect('/');

    await databaseApi.leaveTournamentTeam(req.session.userId);

    await basePage(req, res, next);
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
    if (!req.session.userId)
        return res.redirect('/');
        
    await databaseApi.deleteTournamentTeam(req.session.userId);

    await basePage(req, res, next);
}

/**
 * @description Setup function for this route
 * @param {express.Express} app The express app
 */
 function init(app) {
    app.get('/team/find/user', lookupUser);
    app.get('/team/find/teams', lookupTeam);
    app.get('/team*', teamPage);
    app.post('/team/register', registerPage);
    app.post('/team/leave', leavePage);
    app.post('/team/update', updatePage);
    app.post('/team/delete', deletePage);
}

module.exports = {
    init
};