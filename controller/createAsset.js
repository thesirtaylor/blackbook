"use strict";

let User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  create: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    let files = req.files;

    try {
      let user = await User.findOne({ _id: payload.user });
      if (user) {
        let result = await files;
        console.log(result);
        if (result) {
          // name variables
          let imagekey;
          let rawkey;
          let imageurl;
          let rawurl;
          //extract keys--
          let assetkey = [];
          await result.forEach((ke) => assetkey.push(ke.key));
          //separate keys out--
          await assetkey.forEach((key) =>
            key.match(/\.(jpg|jpeg|png|bmp)$/) ? (imagekey = key) : (rawkey = key)
          );
          //extract location--
          let asseturl = [];
          await result.forEach((url) => asseturl.push(url.location));
          //separate locations out
          await asseturl.forEach((url) =>
            url.match(/\.(jpg|jpeg|png|bmp)$/) ? (imageurl = url) : (rawurl = url)
          );
          let tags = options.tags.split(" ");
          let category = tags[0];
          let asset = await Asset.create({
            title: options.title.replace(/\s+/g, "-"),
            description: options.description,
            uploadresponse: result,
            imageurl: imageurl,
            rawurl: rawurl,
            rawkey: rawkey,
            price: options.price,
            imagekey: imagekey,
            tags: tags,
            category: category,
            _creatorId: user._id,
          });
          if (asset) {
            return res.status(HTTP_STATUS.CREATED).json(SUCCESS(asset));
          } else {
            return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(`DB optimization failed`));
          }
        }
      } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED, Turn on isCreator`));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
    }
  },
};
