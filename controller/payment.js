"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  Asset = require("../model/assets").asset,
  Paid = require("../model/assets").paid,
  logger = require("../lib/logger"),
  axios = require("axios"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  kue = require("kue"),
  queue = kue.createQueue();
const Flutterwave = require("flutterwave-node-v3");
const split_value = 0.25;

async function saveWebhook(request, job, done) {
  try {
    // console.log("request again", request);
    //   console.log("optionss", job.data);
    let username_ = request.customer.fullName.trim();
    // console.log(username_);
    let user = await User.findOne({ username: username_ });
    // console.log(4, user.username);
    let asset = await Asset.findOne({ _id: request.txRef }).select({
      isPaid: 1,
      price: 1,
      _creatorId: 1,
    });
    // console.log(9, asset);
    if (user && asset) {
      // console.log("statuss", request.status);
      if (request.status === "successful") {
        let setTrue = await Asset.updateOne(
          { _id: asset._id },
          { $set: { isPaid: true, _buyerId: user._id } }
        );
        console.log(typeof Paid.create);
        let reqq = request;
        reqq.event_type = reqq["event.type"];
        delete reqq["event.type"];
        let paidTable = await Paid.create({
          assetId: asset._id,
          paidBy: user._id,
          paymentRes: reqq,
          createdBy: asset._creatorId,
        });
        console.log(paidTable);
        // logger.info(`${user.username}- ${user._id}: ${paidTable}`);
        // console.log(`wait`);
        if (!setTrue) {
          logger.info(
            `${user.username}- ${user._id}: Probelms while trying to update Asset Payment status`
          );
          return done(new Error(`Probelms while trying to update Asset Payment status`));
        }
        return done();
      }
      logger.info(`${user.username}- ${user._id}: Payment Unsuccessful`);
      console.log("Payment Unsuccessful");
      return done(new Error(`Payment Unsuccessful`));
    }
    return done(new Error(`Can't save webhook`));
  } catch (error) {
    console.log(error);
    logger.error(`${user._id}: ${user.username}: ${error}`);

    throw error;
  }
}
module.exports = {
  initialize: async (req, res) => {
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      let asset = await Asset.findOne({ _id: req.params.id }).select({
        isPaid: 1,
        price: 1,
        _creatorId: 1,
      });
      function checkID(i, j) {
        return i.localeCompare(j);
      }
      if (!asset) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset don't exist.`));
      }
      let account = await Account.findOne({ _creatorId: asset._creatorId });
      if (!account) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account not registered.`));
      }
      if (asset.isPaid === true) {
        logger.info(`${user.username}- ${user._id}: Asset already purchased`);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Asset already purchased`));
      }
      let x = JSON.stringify(user._id);
      let y = JSON.stringify(asset._creatorId);
      if (checkID(x, y) === 0) {
        logger.info(`${user.username}- ${user._id}: Impossible operation`);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Impossible operation`));
      }
      if (user && asset && account && asset.isPaid === false && checkID(x, y) !== 0) {
        const param = {
          tx_ref: asset._id,
          // amount: asset.price,
          amount: 200000,
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
          logger.info(`${user.username}- ${user._id}: Payment initialization failed`);
          return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Payment initialization failed`));
        }
        return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(pay.data));
      }
    } catch (error) {
      logger.error(`${user._id}: ${user.username}: ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
  webHook: async function (req, res) {
    try {
      const hash = req.headers[`verif-hash`];
      if (!hash) {
        logger.info(`No hash signature in request headers`);
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ERR(`No hash signature in request headers`));
      }
      const secret_hash = process.env.FLW_HASH;
      if (hash !== secret_hash) {
        logger.info(`verification failed`);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`verification failed`));
      }
      let request = req.body;
      console.log("request", request);
      queue.create("transacion", request).priority(-15).attempts(5).save();
      //haven't tested this out
      //used it because of this error
      //=> (node:9140) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
      // 11 job ttl exceeded listeners added to [Queue]. Use emitter.setMaxListeners()
      //to increase limit
      queue.process("transacion", 20, (job, done) => {
        saveWebhook(request, job, done);
        queue.setMaxListeners(queue.getMaxListeners() + 1);
        done();
      });
      res.sendStatus(200);
    } catch (error) {
      logger.error(`${user._id}: ${user.username}: ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.PRECONDITION_REQUIRED).json(ERR(`error`));
    }
  },
};
