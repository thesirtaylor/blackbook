"use strict";

let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  Paid = require("../model/assets").paid,
  logger = require("../lib/logger"),
  HTTP_STATUS = require("../util/httpstatus");
const MongoId = require("mongodb").ObjectID;
const redisClient = require("../lib/redis").redisClient;


module.exports = {
  transactions: async (req, res) => {
    let payload = req.decoded;

    try {
      let iid = MongoId(payload.user);
      // console.log(iid);
      let aggregate = [
        {
          $match: {
            $or: [
              {
                createdBy: iid,
              },
              { paidBy: iid },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "paidBy",
            foreignField: "_id",
            as: "buyer",
          },
        },
        {
          $lookup: {
            from: "assets",
            localField: "assetId",
            foreignField: "_id",
            as: "asset",
          },
        },
        {
          $sort: { paidAt: -1 },
        },
        {
          $unwind: "$asset",
        },
        {
          $unwind: "$buyer",
        },
        {
          $unwind: "$creator",
        },
        {
          $project: {
            transaction_date: "$paidAt",
            buyer_email: "$buyer.email",
            creater_username: "$creator.username",
            payment_mode: "$paymentRes.event_type",
            charged_fee: "$paymentRes.charged_amount",
            asset_initial: "$paymentRes.amount",
            transaction_fee: "$paymentRes.appfee",
            transaction_currency: "$paymentRes.currency",
            asset_name: "$asset.title",
            asset_category: "$asset.category",
            asset_description: "$asset.description",
            asset_creation_date: "$asset.createdAt",
          },
        },
      ];

      let transactionData = await Paid.aggregate(aggregate);
      if (transactionData && Object.keys(transactionData).length) {
        let key = "__express__" + req.originalUrl || req.url;
        redisClient.setex(key, 1500, JSON.stringify(transactionData, null, 4));

        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(transactionData));
      }
      logger.info(`No Data`);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(`No Data`));
    } catch (error) {
      logger.error(error);
      // console.log(error);
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
};
