const uuidv5 = require('uuid').v5;
const uuidNamespace = require('../../settings.json').uuidNamespace;

function getId(userId, version) {
    return uuidv5(userId + "v" + version, uuidNamespace);
}

module.exports = {
    getId: getId
};