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



module.exports = { CREATE_HASH };