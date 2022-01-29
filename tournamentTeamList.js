const databaseApi = require("./server/dal/databaseApi");
const discordApi = require("./server/dal/discordApi");
const { Parser } = require('json2csv');
const fs = require('fs');

async function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }

(async function() {
    await delay(5000);

    const teamList = await databaseApi.getAllTournamentTeams();
    const teamsByMember = [];
    const teamsByTourney = [];

    let team;
    for (var i = 0; i < teamList.length; i++) {
        team = teamList[i];

        for (const userId of team.team) {
            let user = await discordApi.getUserById(userId);

            teamsByMember.push({
                userId,
                teamName: team.name,
                tournament: team.tournament,
                username: user.name
            });
        }

        teamsByTourney.push({
            teamName: team.name,
            captain: team.captain,
            tournament: team.tournament,
            playerCount: team.team.length
        });
    }

    const teamsByMemberParser = new Parser({
        userFields: [
            "tournament",
            "teamName",
            "userId",
            "username"
        ]
    });

    const teamsByTourneyParser = new Parser({
        userFields: [
            "tournament",
            "teamName",
            "captain",
            "playerCount"
        ]
    });

    fs.writeFile("teamsByMember.csv", teamsByMemberParser.parse(teamsByMember), (err, data) => {
        if (err) {
            return console.log(err);
          }
          console.log(data);
    });

    fs.writeFile("teamsByTourney.csv", teamsByTourneyParser.parse(teamsByTourney), (err, data) => {
        if (err) {
            return console.log(err);
          }
          console.log(data);
    });
})();