'use strict';

const jwt = require("jsonwebtoken");
const jwtsecret = process.env.JWTSECRET;
const HTTP_STATUS = require('../util/httpstatus')

 module.exports = {
   checkToken: (req, res, next) => {
     var token = req.headers["x-access-token"] || req.headers.authorization;
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
       return res.status(HTTP_STATUS.NETWORK_AUTHENTICATION_REQUIRED).json(ERR("Auth token is not supplied"));
     }
   },
 };