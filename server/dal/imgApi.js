const ImgurAnonymousUploader = require('imgur-anonymous-uploader');
const imgurSettings = require("../../imgur.json");
const sizeOf = require('image-size');
// const deepai = require('deepai'); 
// const deepaiSettings = require("../../deepai.json");
const databaseApi = require("./databaseApi");

// deepai.setApiKey(deepaiSettings.apikey);

// only allow jpg and png
sizeOf.disableTypes(["bmp", "cur", "dds", "gif", "icns", "ico", "j2c",
"jp2", "ktx", "pnm", "psd", "svg", "tiff", "webp" ]);

const uploader = new ImgurAnonymousUploader(imgurSettings.clientid);

/**
 * @description Try to upload an image to imgur.  Checks file size as well as content policy
 * @param {Buffer} img Image to try to upload to imgur
 * @returns The link and delete hash if successful
 */
async function createDrip(userId, img) {
    // until we have an alternative to the nsfw API, disable this path
    throw "UPLOAD LIMIT EXCEEDED";

    var userData = await databaseApi.getUserProfileByUserId(userId);

    var oldDripDeleteHash = null;

    if (userData && userData.dripDeleteHash && userData.dripDeleteHash !== "NONE")
        oldDripDeleteHash = userData.dripDeleteHash;

    const dimensions = sizeOf(img);

    if (!dimensions)
        throw "Invalid image";

    if (dimensions.width > 512)
        throw "Image cannot be wider than 512px";

    if (dimensions.width < 64)
        throw "Image cannot be smaller than 64px";

    if (dimensions.height > 512)
        throw "Image cannot be taller than 512px";

    if (dimensions.height < 64)
        throw "Image cannot be smaller than 64px;";

    if (await databaseApi.canUpdate(userId)) {
        await databaseApi.updateUserProfile(userId, {
            uploadAttempt: true
        });

        // TODO: figure out an alternative to this...
        // var resp = await deepai.callStandardApi("nsfw-detector", {
        //     image: img
        // });
    
        // if (resp.output.nsfw_score > 0.6)
        //     throw "Possible NSFW content: " + resp.output.nsfw_score;
    
        const response = await uploader.uploadBuffer(img);

        await databaseApi.updateUserProfile(userId, {
            drip: response.url,
            dripDeleteHash: response.deleteHash
        });

        if (oldDripDeleteHash)
            await deleteImage(oldDripDeleteHash);
    
        return {
            url: response.url,
            deleteHash: response.deleteHash
        };
    } else {
        // user cannot upload an image right now
        throw "UPLOAD LIMIT EXCEEDED";
    }
}

/**
 * @description Try to upload an image to imgur.  This data has already been checked
 * @param {Buffer} img Image to try to upload to imgur
 * @returns The link and delete hash if successful
 */
async function uploadCard(userId, img) {
    const userData = await databaseApi.getUserProfileByUserId(userId);

    var oldCardDeleteHash = null;

    if (userData && userData.cardDeleteHash && userData.cardDeleteHash !== "NONE")
        oldCardDeleteHash = userData.cardDeleteHash;
        
    const response = await uploader.uploadBuffer(img);

    await databaseApi.updateUserProfile(userId, {
        card: response.url,
        cardDeleteHash: response.deleteHash
    });

    if (oldCardDeleteHash)
        await deleteImage(oldCardDeleteHash);

    return {
        url: response.url,
        deleteHash: response.deleteHash
    };
}

async function uploadTemplate(userId, slot, img, name, searchTerms, friendcodecolor, namecolor) {
    // until we have an alternative to the nsfw API, disable this path
    throw "UPLOAD LIMIT EXCEEDED";

    const dimensions = sizeOf(img);

    if (dimensions.width !== 1204)
        throw "Image must be exactly 1204px in width";

    if (dimensions.height !== 630)
        throw "Image must be exactly 630px in height";

    if (await databaseApi.canUpdate(userId)) {
        await databaseApi.updateUserProfile(userId, {
            uploadAttempt: true
        });

        // TODO: figure out an alternative to this...
        // var resp = await deepai.callStandardApi("nsfw-detector", {
        //     image: img
        // });
    
        // if (resp.output.nsfw_score > 0.6)
        //     throw "Possible NSFW content: " + resp.output.nsfw_score;
    
        const response = await uploader.uploadBuffer(img);

        const previousTemplate = await databaseApi.getTemplate(userId + "-" + slot);

        const newTemplate = await databaseApi.updateTemplate(userId, slot, response.url, response.deleteHash, name, searchTerms, friendcodecolor, namecolor);

        if (previousTemplate)
            await deleteImage(previousTemplate.deleteHash);

        return {
            ...newTemplate
        };
    } else {
        // user cannot upload an image right now
        throw "UPLOAD LIMIT EXCEEDED";
    }
}

/**
 * @description Deletes an image from imgur based on it's delete hash
 * @param {String} hash The imgur delete hash
 * @returns Response status
 */
async function deleteImage(hash) {
    const response = await uploader.delete(hash);

    return {
        success: response.success,
        status: response.status
    };
}

module.exports = {
    createDrip,
    deleteImage,
    uploadCard,
    uploadTemplate
};