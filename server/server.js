const express = require('express');
const path = require('path');
const appSettings = require("../settings.json");
const cookieParser = require('cookie-parser');
const { login, hasApiKey, hasUserCookie, botTokenLogin } = require("./logic/login");
const { addRoutes } = require("./logic/routeSetup");

const app = express();

var server = require("http").createServer(app);

if (!appSettings.secure && appSettings.secureCookie) {
    app.set('trust proxy', 'loopback');
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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

app
    .use(express.static(__dirname + '/../public'))
    .use("/discordlogin", require("./discordlogin"))
    .use("/logout", require("./logout"))
    .use(require("./p"))
    .use("/api", addRoutes(__dirname + "/routes"))
    .get("*", (req, res) => res.sendFile(path.resolve(__dirname, "../public/index.html")));

server.listen(appSettings.http);