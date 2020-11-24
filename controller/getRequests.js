"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  Asset = require("../model/assets").asset,
  logger = require("../lib/logger"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  assetbyTime_un: async (req, res) => {
    try {
      let aggregate = [
        {
          $match: { blocked: false, isPaid: false },
        },
        {
          $lookup: {
            from: "users",
            localField: "_creatorId",
            foreignField: "_id",
            as: "creator_data",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            title: 1,
            description: 1,
            imageurl: 1,
            // rawurl: 1,
            price: 1,
            tags: 1,
            flag: { $size: "$flag" },
            category: 1,
            creator_data: {
              username: 1,
            },
          },
        },
      ];
      let asset = await Asset.aggregate(aggregate);
      if (asset && Object.keys(asset).length) {
        // console.log(asset);
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(asset));
      }
      // console.log(`No Data`);
      logger.info(`No data`);
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (error) {
      logger.error(error);
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
  assetsByTags: async (req, res) => {
    try {
      let aggregate = [
        {
          $match: { blocked: false, isPaid: false },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $sort: { count: -1, createdAt: -1 },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            "data.tags": 1,
            "data.isPaid": 1,
            "data.title": 1,
            "data.description": 1,
            "data.imageurl": 1,
            // "data.rawurl": 1,
            "data.price": 1,
            "data.category": 1,
          },
        },
      ];
      let tags = await Asset.aggregate(aggregate);
      if (tags) {
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(tags));
      }
      logger.info(`No data`);
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (error) {
      logger.error(`${error}`);
      console.log(err);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(err));
    }
  },
};
