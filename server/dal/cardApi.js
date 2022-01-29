const { createCanvas, loadImage, registerFont, PNGStream } = require('canvas');
const path = require("path");
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

    // add the template to the canvas
    const template = await loadImage(getTemplate(templateName));
    ctx.drawImage(template, 0, 0);

    // add the user image to the canvas
    const userImage = await loadImage(img);
    const leftEdge = (512 - userImage.width) / 2;
    const topEdge = (512 - userImage.height) / 2;
    ctx.drawImage(userImage, 72 + leftEdge, 59 + topEdge);

    // prepare the text
    ctx.font = '55px Splatoon';

    // add the friend code to the image
    ctx.fillStyle = getFriendCodeColor(templateName);
    ctx.textAlign = 'right';
    ctx.fillText(friendCode, 1172, 134);

    // add the name to the image
    ctx.fillStyle = getNameColor(templateName);
    ctx.textAlign = 'right';
    ctx.fillText(name, 1172, 229);

    return canvas.toBuffer();
}

function getTemplate(templateName) {
    switch (templateName) {
        case "s2-chaos-order":
            return path.join(__dirname, "../../public/css/img/canvas_s2_chaos_order.png");
        case "s2-order-chaos":
            return path.join(__dirname, "../../public/css/img/canvas_s2_order_chaos.png");
        case "s2-octavio":
            return path.join(__dirname, "../../public/css/img/canvas_s2_octavio.png");
        case "s3-agent3":
            return path.join(__dirname, "../../public/css/img/canvas_s3_agent3.png");
        case "s3-marie":
            return path.join(__dirname, "../../public/css/img/canvas_s3_marie.png");
        case "user-coffee-squid":
            return path.join(__dirname, "../../public/css/img/canvas_user_coffee_squid.png");
        case "s2-black-firefin":
            return path.join(__dirname, "../../public/css/img/canvas_s2_black_firefin.png");
        case "s2-sanitized-pink": 
            return path.join(__dirname, "../../public/css/img/canvas_s2_sanitized_pink.png");
        case "s3-callie":
            return path.join(__dirname, "../../public/css/img/canvas_s3_callie.png");
        case "user-black-gold":
            return path.join(__dirname, "../../public/css/img/canvas_user_black_gold.png");
        case "s2-toni-kensa-inverted":
            return path.join(__dirname, "../../public/css/img/canvas_s2_toni_kensa_inverted.png");
        case "s2-toni-kensa":
            return path.join(__dirname, "../../public/css/img/canvas_s2_toni_kensa.png");
        case "s1-blue-orange":
            return path.join(__dirname, "../../public/css/img/canvas_s1_blue_orange.png");
        case "s1-orange-blue":
            return path.join(__dirname, "../../public/css/img/canvas_s1_orange_blue.png");
        case "s2-pink-green":
            return path.join(__dirname, "../../public/css/img/canvas_s2_pink_green.png");
        case "s2-green-pink":
            return path.join(__dirname, "../../public/css/img/canvas_s2_green_pink.png");
        case "s3-indigo-yellow":
            return path.join(__dirname, "../../public/css/img/canvas_s3_indigo_yellow.png");
        case "s3-yellow-indigo":
        default:
            return path.join(__dirname, "../../public/css/img/canvas_s3_yellow_indigo.png");
    }
}

function getFriendCodeColor(templateName) {
    switch (templateName) {
        case "user-coffee-squid":
            return 'rgba(104,56,24,1)';
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
            return 'rgba(0,0,0,1)';
        case "s2-toni-kensa-inverted":
        case "user-black-gold":
        case "s2-black-firefin":
        default:
            return 'rgba(255,255,255,1)';
    }
}

function getNameColor(templateName) {
    switch (templateName) {
        case "user-coffee-squid":
            return 'rgba(244,237,225,1)';
        case "s2-toni-kensa-inverted":
        case "s1-blue-orange":
        case "s2-pink-green":
        case "s2-green-pink":
        case "s3-indigo-yellow":
        case "user-black-gold":
        case "s2-black-firefin":
        case "s2-chaos-order":
        case "s2-order-chaos":
            return 'rgba(0,0,0,1)';
        case "s2-toni-kensa":
        case "s1-orange-blue":
        case "s3-yellow-indigo":
        case "s3-callie":
        case "s2-sanitized-pink":
        case "s2-octavio":
        case "s3-agent3":
        case "s3-marie":
        default:
            return 'rgba(255,255,255,1)';
    }
}

module.exports = {
    createCard
};