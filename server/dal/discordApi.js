const DiscordApi = require('discord.js');

const discord = new DiscordApi.Client({ 
    intents: [
        DiscordApi.Intents.FLAGS.GUILDS,
        DiscordApi.Intents.FLAGS.GUILD_MESSAGES,
        DiscordApi.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        DiscordApi.Intents.FLAGS.GUILD_MEMBERS,
        DiscordApi.Intents.FLAGS.GUILD_PRESENCES
    ], 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});

const token = require('../../discord.json').token;

// login to discord - we should auto reconnect automatically
discord.login(token).catch(console.error);

/**
 * @description Lookup a username by ID
 * @param {String} id The user ID
 * @returns The user's discord username
 */
async function getUserById(id) {
    try {
        const user = await discord.users.fetch(id);
    
        if (!user)
            return "unknown";

        return {
            id: user.id,
            name: user.username + "#" + user.discriminator,
            avatar: user.avatarURL()
        };
    } catch (err) {
        console.log("Unable to get user");

        return "unknown";
    }
}

async function cacheGuildList() {
    var guild = discord.guilds.cache.get("86177841854566400");

    await guild.members.fetch();
}

var refresh = {
    last: null
};

async function findUserByName(search) {
    try {
        if (!refresh.last || Date.now().valueOf() - refresh.last > 1000 * 60 * 60 * 12) {
            refresh.last = Date.now().valueOf();
            await cacheGuildList();
        }

        var guild = discord.guilds.cache.get("86177841854566400");

        search = search.toUpperCase();
        const allUsers = guild.members.cache;
        const users = allUsers.filter(member => ("" + member.user.username + "#" + member.user.discriminator).toUpperCase().indexOf(search) > -1);

        return users.map(member => {
            return {
                id: member.user.id,
                name: member.user.username + "#" + member.user.discriminator,
                avatar: member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` : "/css/img/discord.png"
            };
        }).slice(0, 5);
    } catch (err) {
        console.log("Unable to search for some reason");

        return [];
    }
}

module.exports = {
    getUserById,
    findUserByName
};