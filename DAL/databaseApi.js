const Firestore = require('@google-cloud/firestore');
const idApi = require('./idApi');

const db = new Firestore({
    projectId: 'rsplatoon-discord',
    keyFilename: './firebase.json',
});

const userCache = [];
const botCache = [];

const metrics = {
    calls: 1,
    time: ""
};

function currentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    
    return today;
}

function limit() {
    var date = currentDate();

    if (metrics.time === date) {
        metrics.calls++;
    } else {
        metrics.time = date;
        metrics.calls = 1;
    }

    if (metrics.calls > 10000)
        throw "API Limit call for day reached";
}

function addToCache(item, cache, limit = 1000) {
    cache.unshift(item);

    while (cache.length > limit)
        cache.pop();
}

function removeFromCache(item, cache) {
    for (var i = 0; i < cache.length; i++) {
        if (cache[i].userId === item.userId || cache[i].id === item.id) {
            var first = cache[i];

            cache.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });

            cache.shift();

            return true;
        }
    }

    return false;
}

function checkCache(item, cache) {
    for (var i = 0; i < cache.length; i++) {
        if (cache[i].userId === item.userId || cache[i].id === item.id) {
            var first = cache[i];

            cache.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });
            
            return first;
        }
    }
}

function userChangesIsEmpty(data) {
    if (data) {
        if (data.friendCode)
            return false;
        if (data.drip)
            return false;
        if (data.dripDeleteHash)
            return false;
        if (data.template)
            return false;
        if (data.card)
            return false;
        if (data.cardDeleteHash)
            return false;
        if (data.uploadAttempt)
            return false;
    }

    return true;
}

function botChangesIsEmpty(data) {
    if (data) {
        if ("getProfile" in data)
            return false;
        if ("saveFriendCode" in data)
            return false;
        if ("saveUsername" in data)
            return false;
        if ("saveDrip" in data)
            return false;
        if ("deleteProfile" in data)
            return false;
        if ("nobot" in data) 
            return false;
    }

    return true
}

function weekStart() {
    var date = new Date();
    return new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
}

const UPDATE_LIMIT = 20;

async function canUpdate(userId) {
    const userData = await getUserProfileByUserId(userId);

    if (userData && userData.recentUpdates && userData.recentUpdates.length) {
        if (userData.recentUpdates.length < UPDATE_LIMIT)
            return true;

        var current = weekStart();

        for (var i = 0; i < userData.recentUpdates.length; i++) {
            if (userData.recentUpdates[i] !== current)
                return true;
        }
    } else {
        return true;
    }

    return false;
}

async function updateUserProfile(userId, changes, updateVersion) {
    if (userChangesIsEmpty(changes) && !updateVersion)
        return;

    limit();
        
    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (!doc.exists) {
        await profileRef.set({
            userId: userId,
            friendCode: changes.friendCode ?? "",
            name: changes.name ?? "",
            drip: changes.drip ?? "NONE",
            dripDeleteHash: changes.dripDeleteHash ?? "NONE",
            template: changes.template ?? "s3-yellow-indigo",
            card: changes.card ?? "NONE",
            cardDeleteHash: changes.cardDeleteHash ?? "NONE",
            recentUpdates: [],
            createdOn: Firestore.Timestamp.now(),
            updatedOn: Firestore.Timestamp.now(),
            version: 1
        });

        var id = idApi.getId(userId, 1);

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: 1
        });

        addToCache({
            userId: userId,
            friendCode: changes.friendCode,
            name: changes.name,
            drip: changes.drip,
            dripDeleteHash: changes.dripDeleteHash,
            template: changes.template,
            card: changes.card,
            cardDeleteHash: changes.cardDeleteHash,
            recentUpdates: [],
            version: 1,
            id: id
        }, userCache);

        return id;
    } else {
        var newData = {};

        var data = doc.data();

        var countIt = false;

        if (changes.friendCode) {
            newData.friendCode = changes.friendCode;
            data.friendCode = changes.friendCode;
            countIt = true;
        }

        if (changes.name) {
            newData.name = changes.name;
            data.name = changes.name;
            countIt = true;
        }

        if (changes.drip) {
            // this will be managed by upload attempt
            newData.drip = changes.drip;
            data.drip = changes.drip;
        }

        if (changes.dripDeleteHash) {
            // this will be managed by upload attempt
            newData.dripDeleteHash = changes.dripDeleteHash;
            data.dripDeleteHash = changes.dripDeleteHash;
        }

        if (changes.template) {
            newData.template = changes.template;
            data.template = changes.template;
            countIt = true;
        }

        if (changes.card) {
            // this will be managed by upload attempt
            newData.card = changes.card;
            data.card = changes.card;
        }

        if (changes.cardDeleteHash) {
            // this will be managed by upload attempt
            newData.cardDeleteHash = changes.cardDeleteHash;
            data.cardDeleteHash = changes.cardDeleteHash;
        }

        var id = idApi.getId(userId, data.version);

        if (updateVersion) {
            data.version++;
            newData.version = data.version;

            var idOldRef = await db.collection("ids").doc(id);
            var idOldDoc = await idOldRef.get();

            if (idOldDoc.exists) {
                await idOldDoc.delete();
            }

            countIt = true;

            id = idApi.getId(userId, data.version);
        }

        if (changes.uploadAttempt || countIt) {
            if (!data.recentUpdates)
                data.recentUpdates = [];

            data.recentUpdates.push(weekStart());

            if (data.recentUpdates.length > UPDATE_LIMIT)
                data.recentUpdates.shift();

            newData.recentUpdates = data.recentUpdates;
        }

        newData.updatedOn = Firestore.Timestamp.now();

        await profileRef.set(newData, { merge: true });

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: data.version
        });

        var inCacheValue = checkCache({ userId: userId }, userCache);

        if (inCacheValue) {
            inCacheValue.friendCode = data.friendCode;
            inCacheValue.name = data.name;
            inCacheValue.drip = data.drip;
            inCacheValue.dripDeleteHash = data.dripDeleteHash;
            inCacheValue.template = data.template;
            inCacheValue.card = data.card;
            inCacheValue.cardDeleteHash = data.cardDeleteHash;
            inCacheValue.recentUpdates = data.recentUpdates;
            inCacheValue.version = data.version;
            inCacheValue.id = id;
        } else {
            addToCache({
                userId: userId,
                friendCode: data.friendCode,
                name: data.name,
                drip: data.drip,
                dripDeleteHash: data.dripDeleteHash,
                template: data.template,
                card: data.card,
                cardDeleteHash: data.cardDeleteHash,
                recentUpdates: data.recentUpdates,
                version: data.version,
                id: id
            }, userCache);
        }

        return id;
    }
}

async function getUserProfileByUserId(userId) {
    var inCacheValue = checkCache({ userId: userId }, userCache);

    if (inCacheValue)
        return inCacheValue;

    limit();

    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (doc.exists) {
        var data = doc.data();

        data.id = idApi.getId(userId, data.version);

        addToCache(data, userCache);

        return data;
    } else {
        return null;
    }
}

async function getUserProfileById(id) {
    var inCacheValue = checkCache({ id: id }, userCache);

    if (inCacheValue)
        return inCacheValue;

    limit();

    var idRef = await db.collection("ids").doc(id);
    var idDoc = await idRef.get();

    if (idDoc.exists) {
        var userId = idDoc.data().userId;
        return await getUserProfileByUserId(userId);
    } else {
        return null;
    }
}

async function removeUserProfile(userId) {
    var inCacheValue = checkCache({ userId: userId }, userCache);

    if (inCacheValue)
        removeFromCache({ userId: userId }, userCache);

    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (doc.exists) {
        var data = doc.data();

        var id = idApi.getId(userId, data.version);

        var idRef = await db.collection("ids").doc(id);
        var idDoc = await idRef.get();

        if (idDoc.exists) {
            await idRef.delete();
        }

        await profileRef.delete();
    }
}

async function getBot(id) {
    var inCacheValue = checkCache({ id: id }, botCache);

    if (inCacheValue) {
        if (inCacheValue.nobot)
            return null;

        return inCacheValue;
    }

    limit();

    var idRef = await db.collection("ids").doc(id);
    var idDoc = await idRef.get();

    if (idDoc.exists) {
        var userId = idDoc.data().userId;
        return await getUserBotByUserId(userId);
    } else {
        return null;
    }
}

async function getUserBotByUserId(userId) {
    var inCacheValue = checkCache({ userId: userId }, botCache);

    if (inCacheValue) {
        if (inCacheValue.nobot)
            return null;

        return inCacheValue;
    }

    limit();

    var botRef = await db.collection("bots").doc(userId);
    var doc = await botRef.get();

    if (doc.exists) {
        var data = doc.data();

        data.id = idApi.getId("bot:" + userId, data.version);

        addToCache(data, botCache);

        if (data.nobot)
            return null;

        return data;
    } else {
        return null;
    }
}

async function getAllBots() {
    var botRef = await db.collection("bots").get();
    return botRef.docs.map(doc => doc.data());
}

async function saveBot(userId, changes, updateVersion) {
    if (botChangesIsEmpty(changes) && !updateVersion)
        return;

    var user = getUserProfileByUserId(userId);

    if (user.nobot)
        return;

    var botRef = await db.collection("bots").doc(userId);
    var doc = await botRef.get();

    if (!doc.exists) {
        await botRef.set({
            userId: userId,
            createdOn: Firestore.Timestamp.now(),
            updatedOn: Firestore.Timestamp.now(),
            version: 1,
            getProfile: "getProfile" in changes ? changes.getProfile : false,
            saveFriendCode: "saveFriendCode" in changes ? changes.saveFriendCode : false,
            saveUsername: "saveUsername" in changes ? changes.saveUsername : false,
            saveDrip: "saveDrip" in changes ? changes.saveDrip : false,
            deleteProfile: "deleteProfile" in changes ? changes.deleteProfile : false,
            nobot: "nobot" in changes ? changes.nobot : false
        });

        var id = idApi.getId("bot:" + userId, 1);

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: 1,
            type: "bot"
        });

        addToCache({
            userId: userId,
            version: 1,
            id: id,
            getProfile: "getProfile" in changes ? changes.getProfile : false,
            saveFriendCode: "saveFriendCode" in changes ? changes.saveFriendCode : false,
            saveUsername: "saveUsername" in changes ? changes.saveUsername : false,
            saveDrip: "saveDrip" in changes ? changes.saveDrip : false,
            deleteProfile: "deleteProfile" in changes ? changes.deleteProfile : false,
            nobot: "nobot" in changes ? changes.nobot : false
        }, botCache);

        return id;
    } else {
        var newData = {};

        var data = doc.data();

        if ("getProfile" in changes) {
            if (!changes.getProfile)
                changes.getProfile = false;

            newData.getProfile = changes.getProfile;
            data.getProfile = changes.getProfile;
        }

        if ("saveFriendCode" in changes) {
            if (!changes.saveFriendCode)
                changes.saveFriendCode = false;

            newData.saveFriendCode = changes.saveFriendCode;
            data.saveFriendCode = changes.saveFriendCode;
        }

        if ("saveUsername" in changes) {
            if (!changes.saveUsername)
                changes.saveUsername = false;

            newData.saveUsername = changes.saveUsername;
            data.saveUsername = changes.saveUsername;
        }

        if ("saveDrip" in changes) {
            if (!changes.saveDrip)
                changes.saveDrip = false;

            newData.saveDrip = changes.saveDrip;
            data.saveDrip = changes.saveDrip;
        }

        if ("deleteProfile" in changes) {
            if (!changes.deleteProfile)
                changes.deleteProfile = false;

            newData.deleteProfile = changes.deleteProfile;
            data.deleteProfile = changes.deleteProfile;
        }

        if ("nobot" in changes) {
            if (!changes.nobot)
                changes.nobot = false;

            newData.nobot = changes.nobot;
            data.nobot = changes.nobot;
        }

        var id = idApi.getId("bot:" + userId, data.version);

        if (updateVersion) {
            data.version++;
            newData.version = data.version;

            var idOldRef = await db.collection("ids").doc(id);
            var idOldDoc = await idOldRef.get();

            if (idOldDoc.exists) {
                await idOldRef.delete();
            }

            id = idApi.getId("bot:" + userId, data.version);
        }

        newData.updatedOn = Firestore.Timestamp.now();

        await botRef.set(newData, { merge: true });

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: data.version,
            type: "bot"
        });

        var inCacheValue = checkCache({ userId: userId }, botCache);

        if (inCacheValue) {
            inCacheValue.getProfile = data.getProfile;
            inCacheValue.saveFriendCode = data.saveFriendCode;
            inCacheValue.saveUsername = data.saveUsername;
            inCacheValue.saveDrip = data.saveDrip;
            inCacheValue.deleteProfile = data.deleteProfile;
            inCacheValue.nobot = data.nobot;
            inCacheValue.version = data.version;
            inCacheValue.id = id;
        } else {
            addToCache({
                userId: userId,
                getProfile: data.getProfile,
                saveFriendCode: data.saveFriendCode,
                saveUsername: data.saveUsername,
                saveDrip: data.saveDrip,
                deleteProfile: data.deleteProfile,
                nobot: data.nobot,
                version: data.version,
                id: id
            }, botCache);
        }

        return id;
    }
}

module.exports = {
    updateUserProfile,
    getUserProfileById,
    getUserProfileByUserId,
    removeUserProfile,
    canUpdate,
    getBot,
    saveBot,
    getUserBotByUserId,
    getAllBots
};