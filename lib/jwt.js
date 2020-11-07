"use strict";

const jwt = require("jsonwebtoken");
const jwtsecret = process.env.JWTSECRET;
const HTTP_STATUS = require("../util/httpstatus"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success");

let CHECK_TOKEN = (req, res, next) => {
  try {
    var token = req.headers["x-access-token"] || req.headers.authorization;
    if(token === undefined){
      return res
        .status(HTTP_STATUS.NETWORK_AUTHENTICATION_REQUIRED)
        .json(ERR("Trying to access app without proper authorization"));
    }
    if (token.startsWith("Bearer")) {
      token = token.split("Bearer ")[1].trim();
      jwt.verify(token, jwtsecret, (err, decoded) => {
        if (err) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR("You're not signed in."));
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res
        .status(HTTP_STATUS.NETWORK_AUTHENTICATION_REQUIRED)
        .json(ERR("Auth token is not supplied"));
    }
  } catch(error) {
    console.log(error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
  }
};

let SIGN_TOKEN = async (user) => {
  try {
    let sign = await jwt.sign(user, jwtsecret, { expiresIn: "12h" });
    return sign;
  } catch (error) {
    return error;
  }
};

module.exports = { CHECK_TOKEN, SIGN_TOKEN };
