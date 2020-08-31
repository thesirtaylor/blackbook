'use strict';
const bcrypt = require("bcryptjs");
const { user } = require("../model/users");
const SALT_WORK_FACTOR = 10;

let CREATE_HASH = async (str) => {
 try {
   let salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
     let hash = await bcrypt.hash(str, salt);
       return hash;
 } catch (error) {
   return error;
 }
};

let BCRYPT_COMPARE = async (hash, str) => {
  try {
    let res = await bcrypt.compare(str, hash)
    if (res)
      return res;
    return "Password Inconsistent";
  } catch (error) {
    return error
  }
};


module.exports = { CREATE_HASH, BCRYPT_COMPARE };