const fetch = require("node-fetch");
const appSettings = require("../settings.json");

const mee6Url = "https://mee6.xyz/api/plugins/levels/leaderboard/ID?limit=1000&page=";

const userListByServer = {};


//setTimeout(refreshCache, 5000);
//const refreshCacheInterval = setInterval(refreshCache, 86400000);

async function refreshCache() {
    if (appSettings.otherServers && appSettings.otherServers.length) {
        for (var i = 0; i < appSettings.otherServers.length; i++) {
            var otherServer = appSettings.otherServers[i];
            await cacheUserList(otherServer);
        }
    }
}

async function cacheUserList(serverId) {
    var page = 0;
    var previousSet = 0;

    const allUsers = {};
    do {
        var response = await fetch(mee6Url + page);

        if (response) {
            var list = await response.json();

            var users = list.players;

            for (var i = 0; i < users.length; i++) {
                allUsers[users[i].id] = {
                    id: users[i].id,
                    username: users[i].username,
                    discriminator: users[i].discriminator,
                    avatar: users[i].avatar
                };
            }

            previousSet = users.length;
            page++;
        } else {
            previousSet = 0;
        }
    } while(previousSet === 1000);

    const finalUsers = [];

    Object.keys(allUsers).forEach(key => {
        finalUsers.push(allUsers[key]);
    });

    userListByServer[serverId] = finalUsers;
}

async function searchUserList(serverId, search) {
    search = search.toUpperCase();

    if (userListByServer[serverId]) {
        const users = userListByServer[serverId].filter(member => ("" + member.username + "#" + member.discriminator).toUpperCase().indexOf(search) > -1);

        return users.map(member => {
            return {
                id: member.id,
                name: member.username + "#" + member.discriminator,
                avatar: member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}` : "/css/img/discord.png"
            };
        }).slice(0, 5);
    } else {
        return [];
    }
}

module.exports = {
    searchUserList
};
