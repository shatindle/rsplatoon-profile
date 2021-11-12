const DiscordApi = require('discord.js');

const discord = new DiscordApi.Client({ 
    intents: [
        DiscordApi.Intents.FLAGS.GUILDS,
        DiscordApi.Intents.FLAGS.GUILD_MESSAGES,
        DiscordApi.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ], 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});

const token = require('../discord.json').token;

// login to discord - we should auto reconnect automatically
discord.login(token).catch(console.error);

/**
 * @description Lookup a username by ID
 * @param {String} id The user ID
 * @returns The user's discord username
 */
async function getUsernameById(id) {
    try {
        const user = await discord.users.fetch(id);
    
        if (!user)
            return "unknown";

        return user.username + "#" + user.discriminator;
    } catch (err) {
        console.log("Unable to get user");

        return "unknown";
    }
}

module.exports = {
    getUsernameById
};