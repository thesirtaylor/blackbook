"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
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
      let account = await Account.findOne({ _userId: payload.user });
      let user = await User.findOne({ _id: payload.user });
      if (user.isCreator === true && account) {
        var params = {
          Bucket: "blackbook-dirty-bucket" /* required */,
          EncodingType: "url",
        };
        var keys = [];
        var keyVal = [];
        s3.listObjectsV2(params, function (err, data) {
          if (err) {
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
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ERR(`Turn on the Creator Privilege and fill Bank details`));
      }
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
