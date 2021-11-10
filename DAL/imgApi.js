const ImgurAnonymousUploader = require('imgur-anonymous-uploader');
const imgurSettings = require("../imgur.json");
const sizeOf = require('image-size');
const deepai = require('deepai'); 
const deepaiSettings = require("../deepai.json");

deepai.setApiKey(deepaiSettings.apikey);

// only allow jpg and png
sizeOf.disableTypes(["bmp", "cur", "dds", "gif", "icns", "ico", "j2c",
"jp2", "ktx", "pnm", "psd", "svg", "tiff", "webp" ]);

const uploader = new ImgurAnonymousUploader(imgurSettings.clientid);

async function uploadImage(img) {
    const dimensions = sizeOf(img);

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

    var resp = await deepai.callStandardApi("nsfw-detector", {
        image: img,
    });

    if (resp.output.nsfw_score > 0.6)
        throw "Possible NSFW content: " + resp.output.nsfw_score;

    const response = await uploader.uploadBuffer(img);

    return {
        url: response.url,
        deleteHash: response.deleteHash
    };
}

module.exports = {
    uploadImage
};