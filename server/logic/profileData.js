const databaseApi = require("../dal/databaseApi");
const cardApi = require("../dal/cardApi");
const imgApi = require("../dal/imgApi");
const fetch = require("node-fetch");
const util = require("util");
const path = require("path");
const readFile = util.promisify(require("fs").readFile);

async function getProfile(id) {
    const userData = await databaseApi.getUserProfileById(id);

    if (userData) {
        const responseData = {};

        responseData.profileId = id;

        responseData.friendCode = userData.friendCode;

        responseData.name = userData.name;

        if (userData.drip && userData.drip !== "NONE")
            responseData.drip = userData.drip;

        // do they have a card?  If not, make one!
        if (!userData.card || userData.card === "NONE") {
            let dripBuffer;

            if (userData.drip && userData.drip !== "NONE") {
                const response = await fetch(userData.drip);
                dripBuffer = Buffer.from(await response.arrayBuffer());
            } else {
                dripBuffer = await readFile(path.join(__dirname, "../../public/css/img/nodrip.png"));
            }

            // update user card
            const cardBuffer = await cardApi.createCard(dripBuffer, userData.template ?? "s3-yellow-indigo", userData.friendCode ?? "0000-0000-0000", userData.name ?? "User");
            await imgApi.uploadCard(userData.userId, cardBuffer);
        }

        responseData.card = userData.card;

        return responseData;
    } else {
        return null;
    }
}

module.exports = {
    getProfile
};
