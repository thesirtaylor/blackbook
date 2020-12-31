"use strict";

let User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  ERR = require("../util/error"),
  logger = require("../lib/logger"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  update: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;

    try {
      let user = await User.findOne({ _id: payload.user });
      let asset = await Asset.findOne({ $and: [{ _id: req.params.id }, { _creatorId: user._id }] });
      if (!user || !asset || asset.blocked || asset.isPaid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      let tags = options.tags.split(" ");
      let category = tags[0];
      if (JSON.stringify(asset.tags) === JSON.stringify(tags)) {
        logger.info(`same tags, no changes.`);
        return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json(ERR(`same tags, no changes.`));
      }
      function change() {
        asset.tags = tags;
        asset.category = category;
        return asset;
      }
      await change();
      let saveTag = await asset.save();
      if (!saveTag) {
        logger.info(`New tag not saved, try again.`);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`New tag not saved, try again.`));
      }
      return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(`tags updated.`));
    } catch (error) {
      logger.error(`${user._id}: ${user.username}: ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
    }
  },
};
