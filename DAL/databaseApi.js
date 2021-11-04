const Firestore = require('@google-cloud/firestore');
const idApi = require('./idApi');

const db = new Firestore({
    projectId: 'rsplatoon-discord',
    keyFilename: './firebase.json',
});

const postCache = [];

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

function removeFromCache(item) {
    for (var i = 0; i < postCache.length; i++) {
        if (postCache[i].userId === item.userId || postCache[i].id === item.id) {
            var first = postCache[i];

            postCache.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });

            postCache.shift();

            return true;
        }
    }

    return false;
}

function checkPostCache(item) {
    for (var i = 0; i < postCache.length; i++) {
        if (postCache[i].userId === item.userId || postCache[i].id === item.id) {
            var first = postCache[i];

            postCache.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });
            
            return first;
        }
    }
}

async function updateUserProfile(userId, friendCode, updateVersion) {
    if (!friendCode && !updateVersion)
        return;

    limit();

    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (!doc.exists) {
        await profileRef.set({
            userId: userId,
            friendCode: friendCode,
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
            friendCode: friendCode,
            version: 1,
            id: id
        }, postCache);

        return id;
    } else {
        var newData = {};

        var data = doc.data();

        if (friendCode !== null) {
            newData.friendCode = friendCode;
            data.friendCode = friendCode;
        }

        if (updateVersion) {
            data.version++;
            newData.version = data.version;

            var idOldRef = await db.collection("ids").doc(id);
            var idOldDoc = await idOldRef.get();

            if (idOldDoc.exists) {
                await idOldDoc.delete();
            }
        }

        newData.updatedOn = Firestore.Timestamp.now();

        await profileRef.set(newData, { merge: true });

        var id = idApi.getId(userId, data.version);

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: data.version
        });

        var inCacheValue = checkPostCache({ userId: userId });

        if (inCacheValue) {
            inCacheValue.friendCode = data.friendCode;
            inCacheValue.version = data.version;
            inCacheValue.id = id;
        } else {
            addToCache({
                userId: userId,
                friendCode: data.friendCode,
                version: data.version,
                id: id
            }, postCache);
        }

        return id;
    }
}

async function getUserProfileByUserId(userId) {
    var inCacheValue = checkPostCache({ userId: userId });

    if (inCacheValue)
        return inCacheValue;

    limit();

    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (doc.exists) {
        var data = doc.data();

        data.id = idApi.getId(userId, data.version);

        addToCache(data, postCache);

        return data;
    } else {
        return null;
    }
}

async function getUserProfileById(id) {
    var inCacheValue = checkPostCache({ userId: userId });

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
    var inCacheValue = checkPostCache({ userId: userId });

    if (inCacheValue)
        removeFromCache({ userId: userId });

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

module.exports = {
    updateUserProfile,
    getUserProfileById,
    getUserProfileByUserId,
    removeUserProfile
};