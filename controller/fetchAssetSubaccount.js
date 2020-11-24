"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  Asset = require("../model/assets").asset,
  isDownloaded = require("../model/assets").downloaded,
  uuid = require("uuid"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  logger = require("../lib/logger"),
  HTTP_STATUS = require("../util/httpstatus"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY;
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.FLW_PUBLICKEY, process.env.FLW_SECRETKEY);

module.exports = {
  subaccountForAsset: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let asset = await Asset.findOne({ _id: req.params.id });
      //look for the account details of asset cretor
      let account = await Account.findOne({ _userId: asset._creatorId }).select("account_id");
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      if (!asset) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset don't exist.`));
      }
      if (asset.isPaid === true) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset already purchased`));
      }
      if (user && asset && account) {
        const flw_payload = account.account_id;
        const response = await flw.Subaccount.fetch(flw_payload);
        if (!response) {
          logger.info(`${user.username}- ${user._id}: Nothing found for this creator`);
          return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Nothing found for this creator`));
        }
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(response));
      }
    } catch (error) {
      logger.error(`${user._id}: ${user.username}: ${error}`);
      // console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
