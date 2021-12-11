const express = require('express');
const path = require('path');
const databaseApi = require("./DAL/databaseApi");
const appSettings = require("./settings.json");
const cookieParser = require('cookie-parser');
const cardApi = require("./DAL/cardApi");
const imgApi = require("./DAL/imgApi");
const fetch = require("node-fetch");
const util = require("util");
const readFile = util.promisify(require("fs").readFile);
const { login, logout, hasApiKey, hasUserCookie, botTokenLogin } = require("./Logic/login");


const app = express();

var server = require("http").createServer(app);

if (!appSettings.secure && appSettings.secureCookie) {
    app.set('trust proxy', 'loopback');
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/fav', express.static(__dirname + '/fav'));
app.use(express.urlencoded());
app.use(cookieParser());

app.use((err, req, res, next) => {
    // Simple error handling here... in real life we might
    // want to be more specific
    console.log(`I'm the error handler. '${err.message}'`);
    res.status(500);
    res.json({ error: "Invalid argument" });
});

// check the "session" now that we're on jwt tokens
app.use(async (req, res, next) => {
    req.session = {};

    if (hasUserCookie(req))
        login(req, res);
    else if (hasApiKey(req))
        await botTokenLogin(req, res);

    next();
});

require("./Logic/discordLoginPage").init(app);
require("./Logic/dripPage").init(app);
require("./Logic/settingsPage").init(app);
require("./Logic/teamPage").init(app);

async function rootPage(req, res, next) {
    try {
        if (req.session.userId) {
            var userData = await databaseApi.getUserProfileByUserId(req.session.userId);
    
            res.render(path.join(__dirname, '/html/root.html'), {
                id: req.session.userId,
                username: req.session.username,
                avatar: req.session.avatar,
                baseUrl: appSettings.baseUrl,
                loginUrl: appSettings.loginUrl, 
                friendCode: userData ? userData.friendCode : "",
                name: userData && userData.name ? userData.name : "",
                drip: userData && userData.drip && userData.drip !== "NONE" ? userData.drip : "",
                template: userData && userData.template ? userData.template : "",
                // card is not available on this page
                profileId: userData ? userData.id : ""
            });
            return;
        }
    
        res.render(path.join(__dirname, '/html/root.html'), {
            id: "",
            username: "",
            avatar: "",
            baseUrl: appSettings.baseUrl,
            loginUrl: appSettings.loginUrl,
            friendCode: "",
            name: "",
            drip: "",
            profileId: ""
        });
    } catch (e) {
        next("Error loading page");
    }
}
app.get('/', rootPage);

async function savePage(req, res, next) {
    try {
        if (req.session.userId) {
            if (!await databaseApi.canUpdate(req.session.userId))
                throw "Update limit has been reached for this user";

            if (req.body.friendcode || req.body.name || req.body.template || req.body.version) {
                if (req.body.friendcode) {
                    // validate friend code
                    req.body.friendcode = req.body.friendcode.replace(/(\r\n|\n|\r)/gm, "");
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
                    dripBuffer = await readFile(path.join(__dirname, "css/img/nodrip.png"));
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
                        req.body.friendcode = req.body.friendcode.replace(/(\r\n|\n|\r)/gm, "");
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
    
                    return res.send({
                        result: "updated"
                    });
                }
    
                return res.send({
                    result: "unable to update friend code"
                });
            } else {
                return res.send({
                    result: "missing userId param"
                });
            }
        }
    
        res.redirect("/?_v=" + new Date().valueOf(), 302);
    } catch (e) {
        next("Invalid data");
    }
}
app.post('/save', savePage);

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
app.post("/delete", deletePage);

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
                            dripBuffer = await readFile(path.join(__dirname, "css/img/nodrip.png"));
                        }

                        // update user card
                        const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
                        await imgApi.uploadCard(req.query.userId, cardBuffer);
                    }
                }

                return res.send({
                    friendCode: userData ? userData.friendCode : "",
                    name: userData && userData.name ? userData.name : "User",
                    drip: userData && userData.drip && userData.drip !== "NONE" ? userData.drip : "",
                    card: userData && userData.card && userData.card !== "NONE" ? userData.card : "",
                    profileId: userData ? userData.id : ""
                });
            } else {
                return res.send({
                    result: "missing userId param"
                });
            }
        }

        if (req.params.id.length !== 36)
            throw "Invalid ID";

        var responseData = {
            id: "",
            username: "",
            avatar: "",
            baseUrl: appSettings.baseUrl,
            loginUrl: appSettings.loginUrl,
            friendCode: "",
            name: "",
            drip: "", 
            card: "",
            profileId: req.params.id
        }

        if (req.session.userId) {
            responseData.id = req.session.userId;
            responseData.username = req.session.username;
            responseData.avatar = req.session.avatar;
        }

        var userData = await databaseApi.getUserProfileById(req.params.id);

        if (userData) {
            responseData.friendCode = userData.friendCode;

            responseData.name = userData.name;

            if (userData.drip && userData.drip !== "NONE")
                responseData.drip = userData.drip;
            
            // do they have a card?  If not, make one!
            if (!userData.card || userData.card === "NONE") {
                var dripBuffer;

                if (userData.drip && userData.drip !== "NONE") {
                    const response = await fetch(userData.drip);
                    dripBuffer = Buffer.from(await response.arrayBuffer());
                } else {
                    dripBuffer = await readFile(path.join(__dirname, "css/img/nodrip.png"));
                }

                // update user card
                const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
                await imgApi.uploadCard(userData.userId, cardBuffer);
            }

            responseData.card = userData.card;

            res.render(path.join(__dirname, '/html/profile.html'), responseData);
            return;
        }

        throw "Profile not found";
    } catch (e) {
        next("Profile not found");
    }
}
app.get("/p(/:id)?", profilePage);

app.get('/logout', (req, res, next) => {
    try {
        logout(res);

        res.render(path.join(__dirname, '/html/logout.html'));
    } catch (e) {
        next(e);
    }
});

server.listen(appSettings.http);