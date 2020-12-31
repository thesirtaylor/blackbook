"use strict";

let User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  ERR = require("../util/error"),
  logger = require("../lib/logger"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  flag: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let asset = await Asset.findOne({ _id: req.params.id });
      //look for the account details of asset cretor
      function checkID(i, j) {
        return i.localeCompare(j);
      }
      let x = JSON.stringify(user._id);
      let y = JSON.stringify(asset._creatorId);
      let exist = asset.flag.map((flaggerId) => flaggerId.flaggerId);
      if (exist.includes(user._id)) {
        ////removes flag from item if it already exist.

        // await Asset.updateOne(
        //   {
        //     _id: asset._id,
        //   },
        //   {
        //     $pull: { flag: { flaggerId: user._id } },
        //   }
        // );
        // return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(true))
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Flag submitted already`));
      }
      if (!user || !asset || asset.blocked || asset.isPaid || checkID(x, y) === 0) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Unauthorized`));
      }
      if (asset.flag.length < 4) {
        await Asset.updateOne(
          { _id: asset._id },
          {
            $addToSet: {
              flag: [
                {
                  flaggerId: user._id,
                  reason: options.reason,
                },
              ],
            },
          }
        );

        return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(`You just flagged this Asset.`));
      }
      if (asset.flag.length === 5) {
        asset.blocked = true;
        let saved = await asset.save();
        if (!saved) {
          logger.info(`${user.username}- ${user._id}: False`);
          return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`False`));
        }
        return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(`Asset flagged`));
      }
    } catch (error) {
      logger.error(`${user._id}: ${user.username}: ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
