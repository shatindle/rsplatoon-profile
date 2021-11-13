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
    if (isEmpty(changes) && !updateVersion)
        return;

    limit();

    if (!canUpdate(userId))
        throw "Limit exceeded";
        
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
        }, postCache);

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

        if (updateVersion) {
            data.version++;
            newData.version = data.version;

            var idOldRef = await db.collection("ids").doc(id);
            var idOldDoc = await idOldRef.get();

            if (idOldDoc.exists) {
                await idOldDoc.delete();
            }

            countIt = true;
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

        var id = idApi.getId(userId, data.version);

        var idRef = await db.collection("ids").doc(id);
        await idRef.set({
            userId: userId,
            version: data.version
        });

        var inCacheValue = checkPostCache({ userId: userId });

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
    canUpdate
};