"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  User = require("../model/users").user,
  logger = require("../lib/logger"),
  Asset = require("../model/assets").asset,
  HTTP_STATUS = require("../util/httpstatus");
const redisClient = require("../lib/redis").redisClient;


module.exports = {
  search: async (req, res) => {
    try {
      let aggregate = [
        {
          $match: {
            $and: [
              {
                $or: [
                  { title: { $regex: req.params.data, $options: "i" } },
                  { category: { $regex: req.params.data, $options: "i" } },
                ],
              },
              { blocked: false },
              { isPaid: false },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            title: 1,
            imageurl: 1,
            price: 1,
            creator: {
              username: 1,
            },
          },
        },
      ];
      let _aggregate = [
        { $match: { username: { $regex: req.params.data, $options: "i" } } },
        {
          $project: {
            username: 1,
          },
        },
      ];
      let allPromises = [Asset.aggregate(aggregate), User.aggregate(_aggregate)];
      let [asset, user] = await Promise.allSettled(allPromises);
      let resp = [asset, user];
        console.log(asset);
      if (resp) {
        let key = "__express__" + req.originalUrl || req.url;
        redisClient.setex(key, 100, JSON.stringify(resp, null, 4));
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(resp));
      }
      // if (resp.values.length < 1) {
      //   logger.info(`Nothing found`);
      //   return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Nothing found`));
      // }
    } catch (error) {
      logger.error(` ${error}`);
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
};
