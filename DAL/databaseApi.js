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

function isEmpty(data) {
    if (data) {
        if (data.friendCode)
            return false;
        if (data.drip)
            return false;
        if (data.dripDeleteHash)
            return false;
        if (data.uploadAttempt)
            return false;
    }

    return true;
}

function weekStart() {
    var date = new Date();
    return new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
}

async function canUpload(userId) {
    const userData = await getUserProfileByUserId(userId);

    if (userData && userData.uploadAttempts && userData.uploadAttempts.length) {
        if (userData.uploadAttempts.length < 3)
            return true;

        var current = weekStart();

        for (var i = 0; i < userData.uploadAttempts.length; i++) {
            if (userData.uploadAttempts[i] !== current)
                return true;
        }
    } else {
        return true;
    }

    

    return false;
}

async function updateUserProfile(userId, changes, updateVersion) {
    if (isEmpty(changes) && !updateVersion)
        return;

    limit();

    var profileRef = await db.collection("profiles").doc(userId);
    var doc = await profileRef.get();

    if (!doc.exists) {
        await profileRef.set({
            userId: userId,
            friendCode: changes.friendCode ?? "",
            drip: changes.drip ?? "NONE",
            dripDeleteHash: changes.dripDeleteHash ?? "NONE",
            uploadAttempts: [],
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
            drip: changes.drip,
            dripDeleteHash: changes.dripDeleteHash,
            uploadAttempts: [],
            version: 1,
            id: id
        }, postCache);

        return id;
    } else {
        var newData = {};

        var data = doc.data();

        if (changes.friendCode) {
            newData.friendCode = changes.friendCode;
            data.friendCode = changes.friendCode;
        }

        if (changes.drip) {
            newData.drip = changes.drip;
            data.drip = changes.drip;
        }

        if (changes.dripDeleteHash) {
            newData.dripDeleteHash = changes.dripDeleteHash;
            data.dripDeleteHash = changes.dripDeleteHash;
        }

        if (changes.uploadAttempt) {
            if (!data.uploadAttempts)
                data.uploadAttempts = [];

            data.uploadAttempts.push(weekStart());

            if (data.uploadAttempts.length > 3)
                data.uploadAttempts.shift();

            newData.uploadAttempts = data.uploadAttempts;
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
            inCacheValue.drip = data.drip;
            inCacheValue.dripDeleteHash = data.dripDeleteHash;
            inCacheValue.uploadAttempts = data.uploadAttempts;
            inCacheValue.version = data.version;
            inCacheValue.id = id;
        } else {
            addToCache({
                userId: userId,
                friendCode: data.friendCode,
                drip: data.drip,
                dripDeleteHash: data.dripDeleteHash,
                uploadAttempts: data.uploadAttempts,
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
    removeUserProfile,
    canUpload
};