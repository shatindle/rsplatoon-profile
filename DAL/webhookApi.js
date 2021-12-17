const fetch = require("node-fetch");

function clone(a) {
    return JSON.parse(JSON.stringify(a));
 }

async function teamCreated(endpoint, payload) {
    const currentTime = Date.now().valueOf();

    try {
        // we are intentionally not calling await
        fetch(endpoint, {
            method: "put",
            body: JSON.stringify({
                data: clone(payload),
                time: currentTime
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (err) {
        console.log("Error when calling webhook: " + err);
    }
}

async function teamDeleted(endpoint, payload) {
    const currentTime = Date.now().valueOf();

    try {
        // we are intentionally not calling await
        fetch(endpoint, {
            method: "delete",
            body: JSON.stringify({
                data: clone(payload),
                time: currentTime
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (err) {
        console.log("Error when calling webhook: " + err);
    }
}

async function teamUpdated(endpoint, payload) {
    const currentTime = Date.now().valueOf();

    try {
        // we are intentionally not calling await
        fetch(endpoint, {
            method: "post",
            body: JSON.stringify({
                data: clone(payload),
                time: currentTime
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (err) {
        console.log("Error when calling webhook " + endpoint + ": " + err);
    }
}

module.exports = {
    teamCreated,
    teamDeleted,
    teamUpdated
};