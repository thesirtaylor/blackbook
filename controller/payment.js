"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  Asset = require("../model/assets").asset,
  Paid = require("../model/assets").paid,
  uuid = require("uuid"),
  axios = require("axios"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  kue = require("kue"),
  queue = kue.createQueue(),
  mailkey = process.env.SENDGRID_API_KEY;
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.FLW_PUBLICKEY, process.env.FLW_SECRETKEY);
const split_value = 0.25;

async function saveWebhook(option, done) {
  let { data } = option.data;
  let { customer: customer_data } = data;
  let username_ = customer_data.name.trim();
  try {
    let user = await User.findOne({ username: username_ });
    console.log(4, user);
    let asset = await Asset.findOne({ _id: data.tx_ref }).select({
      isPaid: 1,
      price: 1,
      _creatorId: 1,
    });
    if (user && asset && asset.isPaid === false) {
      let setpaid = await Paid.create({
        assetId: asset._id,
        paidBy: user._id,
        paymentRes: data,
      });
      if (!setpaid) {
        return done(new Error(`Probelms while saving webhook`));
      }
      if (setpaid && setpaid.paymentRes.status === "successful") {
        let setTrue = await Asset.updateOne({ _id: asset._id }, { $set: { isPaid: true } });
        if (!setTrue) {
          return done(new Error(`Probelms while trying to update Asset Payment status`));
        }
        return done();
      }
      return done(new Error(`Payment Unsuccessful`));
    }
    return done(new Error(`Can't save webhook`));
  } catch (error) {
    return error;
  }
}
module.exports = {
  initialize: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let asset = await Asset.findOne({ _id: req.params.id }).select({
        isPaid: 1,
        price: 1,
        _creatorId: 1,
      });
      function checkID(i, j) {
        return i.localeCompare(j);
      }
      let x = JSON.stringify(user._id);
      let y = JSON.stringify(asset._creatorId);
      let account = await Account.findOne({ _creatorId: asset._creatorId });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      if (!asset) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset don't exist.`));
      }
      if (!account) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account not registered.`));
      }
      if (asset.isPaid === true) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset already purchased`));
      }
      if (checkID(x, y) === 0) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Impossible operation`));
      }
      if (user && asset && account && asset.isPaid === false && checkID(x, y) !== 0) {
        const param = {
          tx_ref: asset._id,
          amount: asset.price,
          currency: account.currency,
          //url to redirect to after payment is concluded
          redirect_url: "https://google.com",
          payment_options: "card",
          customer: {
            email: user.email,
            phone_number: user.phone ? user.phone : "09000000000",
            name: user.username,
          },
          subaccounts: [
            {
              id: account.subaccount_id,
              transaction_charge_type: "percentage",
              transaction_charge: split_value,
            },
          ],
          customizations: {
            title: asset.title,
            description: asset.description,
            // logo: "https://assets.piedpiper.com/logo.png",
          },
        };
        const option = {
          url: "https://api.flutterwave.com/v3/payments",
        };
        const head = {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRETKEY}`,
            "Content-Type": "application/json",
          },
        };
        let pay = await axios.post(option.url, param, head);
        if (!pay) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Payment failed fam`));
        }
        return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(pay.data));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
  webHook: async function (req, res) {
    try {
      const hash = req.headers[`verif-hash`];
      if (!hash) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ERR(`No hash signature in request headers`));
      }
      const secret_hash = process.env.FLW_HASH;

      if (hash !== secret_hash) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`verification failed`));
      }
      let request = req.body;

      queue.create("transacion", request).priority(-15).attempts(5).save();
      queue.process("transacion", 20, (job, done) => {
        saveWebhook(job, done);
        done();
      });
      res.sendStatus(200);
    } catch (error) {
      return res.status(HTTP_STATUS.PRECONDITION_REQUIRED).json(ERR(`error`));
    }
  },
};
