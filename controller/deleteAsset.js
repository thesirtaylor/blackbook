"use strict";

let User = require("../model/users").user,
  Downloaded = require("../model/assets").downloaded,
  Asset = require("../model/assets").asset,
  ERR = require("../util/error"),
  fs = require("fs"),
  SUCCESS = require("../util/success"),
  cloudinary = require("../lib/cloudinaryconfig").upload,
  aws = require("aws-sdk"),
  HTTP_STATUS = require("../util/httpstatus");

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: "us-east-2",
});

module.exports = {
  delete: async (req, res) => {
    let payload = req.decoded;
    let paramOptions = req.params;
    try {
      let user = await User.findOne({ _id: payload.user });
      if (user.isCreator === true) {
        let asset = await Asset.findOne({
          $and: [{ _userId: user._id }, { _id: paramOptions.id }],
        }).select({'uploadresponse': 0, 'price': 0, 'tags': 0});
        if (asset) {
          if (asset.isPaid === true) {
            return res
              .status(HTTP_STATUS.FORBIDDEN)
              .json(ERR(`Asset already purchased, deletion impossible.`));
          } else {
            let imagekey = asset.imagekey;
            let rawkey = asset.rawkey;

            var params = {
              Bucket: "blackbook-dirty-bucket" /* required */,
              Delete: {
                Objects: [
                  {
                    Key: imagekey /* required */,
                    VersionId: "null",
                  },
                  {
                    Key: rawkey /* required */,
                    VersionId: "null",
                  },
                ],
                Quiet: true,
              },
            };
            s3.deleteObjects(params, function (err, data) {
              if (err) {
                console.log(err, err.stack);
                res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(err));
              }
              if (data) {
                asset.remove((err, data) => {
                  if (err) {
                    return res
                      .status(HTTP_STATUS.EXPECTATION_FAILED)
                      .json(ERR(`Deleted Asset not removed from Database.`));
                  } else {
                    return res
                      .status(HTTP_STATUS.ACCEPTED)
                      .json(SUCCESS(`Asset Successfully Removed.`));
                  }
                });
              }
            });
          }
        } else {
          return res.status(HTTP_STATUS.NOT_FOUND).json(ERR("Asset Not Found"));
        }
      } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
    }
  },
};
