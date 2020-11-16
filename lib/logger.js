const { Console } = require("console");
const fs = require("fs");
const stdout = fs.createWriteStream('./stdout.log');
const stdoutError = fs.createWriteStream('./stderr.log');


const logger = new Console({stdout: stdout, stderr: stdoutError});

module.exports.logger = logger;