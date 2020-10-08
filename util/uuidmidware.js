"use strict";

let User = require("../model/users").user,
  ERR = require("../util/error"),
  aws = require("aws-sdk"),
  HTTP_STATUS = require("../util/httpstatus");
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: "us-east-2",
});

module.exports = {
  uuid: async (req, res, next) => {
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      if (user.isCreator === true) {
        var params = {
          Bucket: "blackbook-dirty-bucket" /* required */,
          EncodingType: "url",
        };
        var keys = [];
        var keyVal = [];
        s3.listObjectsV2(params, function (err, data) {
          if (err) {
            console.log(err, err.stack);
            res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(err));
          }
          // an error occurred
          else {
            data.Contents.forEach((key) => keys.push(key));
            keys.forEach((val) => keyVal.push(val.Key));

            req.keys = keyVal;
            req.uuid = user.uuid;
            next();
          } // successful response
        });
      } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Turn on the Creator Privilege`));
      }
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
