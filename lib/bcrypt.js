"use strict";
const bcrypt = require("bcryptjs");
const SALT_WORK_FACTOR = 10;
const logger = require("../lib/logger");
let CREATE_HASH = async (str) => {
  try {
    let salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    let hash = await bcrypt.hash(str, salt);
    return hash;
  } catch (error) {
    logger.error(` ${error}`);
    return error;
  }
};

module.exports = { CREATE_HASH };
