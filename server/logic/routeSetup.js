const { readdirSync } = require('fs');

const routesFolder = __dirname + "/../routes";

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getFiles = source =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

function addRoutes(dir) {
  const express = require("express");
  const router = express.Router();

  const directories = getDirectories(dir);
  directories.forEach((name) => router.use("/" + name, addRoutes(dir + "/" + name)));

  const files = getFiles(dir);
  files.forEach((name) => router.use(require(dir + "/" + name.replace(".js", ""))));

  return router;
}

module.exports = {
    getDirectories,
    getFiles,
    addRoutes
};