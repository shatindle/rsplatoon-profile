const ImgurAnonymousUploader = require('imgur-anonymous-uploader');
const imgurSettings = require("../imgur.json");
const sizeOf = require('image-size');
const deepai = require('deepai'); 
const deepaiSettings = require("../deepai.json");
const databaseApi = require("./databaseApi");

deepai.setApiKey(deepaiSettings.apikey);

// only allow jpg and png
sizeOf.disableTypes(["bmp", "cur", "dds", "gif", "icns", "ico", "j2c",
"jp2", "ktx", "pnm", "psd", "svg", "tiff", "webp" ]);

const uploader = new ImgurAnonymousUploader(imgurSettings.clientid);

/**
 * @description Try to upload an image to imgur.  Checks file size as well as content policy
 * @param {Buffer} img Image to try to upload to imgur
 * @returns The link and delete hash if successful
 */
async function uploadImage(userId, img) {
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

    if (dimensions.width !== dimensions.height)
        throw "Image must be a square";

    if (await databaseApi.canUpload(userId)) {
        await databaseApi.updateUserProfile(userId, {
            uploadAttempt: true
        });

        var resp = await deepai.callStandardApi("nsfw-detector", {
            image: img
        });
    
        if (resp.output.nsfw_score > 0.6)
            throw "Possible NSFW content: " + resp.output.nsfw_score;
    
        const response = await uploader.uploadBuffer(img);
    
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
    uploadImage,
    deleteImage
};