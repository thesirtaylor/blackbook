"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  uuid = require("uuid"),
  axios = require("axios").default,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY;
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.FLW_PUBLICKEY, process.env.FLW_SECRETKEY);
const split_value = 0.25;

module.exports = {
  code: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      const option = {
        //get options.country from /api/countries endpoint
        url: `https://api.flutterwave.com/v3/banks/${options.country}`,
      };
      const head = {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRETKEY}`,
          "Content-Type": "application/json",
        },
      };
      let accountCodes = await axios.get(option.url, head);
      if (!accountCodes) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No Data for this country`));
      }
      console.log(accountCodes.data.data);
      return res.status(HTTP_STATUS.FOUND).json(SUCCESS(accountCodes.data));
    } catch (error) {
      console.log(error.response.data);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error.response.data));
    }
  },
};
