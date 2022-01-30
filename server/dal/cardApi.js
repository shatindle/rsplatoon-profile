const { createCanvas, loadImage, registerFont, PNGStream } = require('canvas');
const path = require("path");
const databaseApi = require("./databaseApi");
const fetch = require("node-fetch");
registerFont(path.join(__dirname, "../../public/css/Splatfont2.ttf"), { family: "Splatoon" });

/**
 * 
 * @param {Buffer} img The image buffer to load
 * @param {String} friendCode The user's friend code
 * @param {String} name The name of the user
 * @returns {Buffer} The file produced
 */
async function createCard(img, templateName, friendCode, name) {
    const canvas = createCanvas(1204, 630);
    const ctx = canvas.getContext('2d');

    const templateData = await databaseApi.getTemplate(templateName);

    // add the template to the canvas
    const template = await loadImage(await getTemplate(templateData.url));
    ctx.drawImage(template, 0, 0);

    // add the user image to the canvas
    const userImage = await loadImage(img);
    const leftEdge = (512 - userImage.width) / 2;
    const topEdge = (512 - userImage.height) / 2;
    ctx.drawImage(userImage, 72 + leftEdge, 59 + topEdge);

    // prepare the text
    ctx.font = '55px Splatoon';

    // add the friend code to the image
    ctx.fillStyle = hexToRgbA(templateData.color_friendcode);
    ctx.textAlign = 'right';
    ctx.fillText(friendCode, 1172, 134);

    // add the name to the image
    ctx.fillStyle = hexToRgbA(templateData.color_name);
    ctx.textAlign = 'right';
    ctx.fillText(name, 1172, 229);

    return canvas.toBuffer();
}

function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}

async function getTemplate(url) {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
}

function getFriendCodeColor(templateName) {
    switch (templateName) {
        case "user-coffee-squid":
            return 'rgba(104,56,24,1)'; // #683818
        case "s2-toni-kensa":
        case "s1-orange-blue":
        case "s3-yellow-indigo":
        case "s1-blue-orange":
        case "s2-pink-green":
        case "s2-green-pink":
        case "s3-indigo-yellow":
        case "s2-sanitized-pink":
        case "s3-callie":
        case "s2-order-chaos":
        case "s2-chaos-order":
        case "s2-octavio":
        case "s3-agent3":
        case "s3-marie":
            return 'rgba(0,0,0,1)'; // #000000
        case "s2-toni-kensa-inverted":
        case "user-black-gold":
        case "s2-black-firefin":
        default:
            return 'rgba(255,255,255,1)'; // #ffffff
    }
}

function getNameColor(templateName) {
    switch (templateName) {
        case "user-coffee-squid":
            return 'rgba(244,237,225,1)'; // #f4ede1
        case "s2-toni-kensa-inverted":
        case "s1-blue-orange":
        case "s2-pink-green":
        case "s2-green-pink":
        case "s3-indigo-yellow":
        case "user-black-gold":
        case "s2-black-firefin":
        case "s2-chaos-order":
        case "s2-order-chaos":
            return 'rgba(0,0,0,1)'; // #000000
        case "s2-toni-kensa":
        case "s1-orange-blue":
        case "s3-yellow-indigo":
        case "s3-callie":
        case "s2-sanitized-pink":
        case "s2-octavio":
        case "s3-agent3":
        case "s3-marie":
        default:
            return 'rgba(255,255,255,1)'; // #ffffff
    }
}

module.exports = {
    createCard
};