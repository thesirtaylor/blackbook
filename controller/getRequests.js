"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  Paid = require("../model/assets").paid,
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
            rawurl: 1,
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
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
  userProfile: async (req, res) => {
    try {
      let user_name = req.params.username;
      let aggregate = [
        {
          $match: { username: user_name },
        },
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "_creatorId",
            as: "created_assets",
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "_id",
            foreignField: "_creatorId",
            as: "acc_details",
          },
        },
        {
          $lookup: {
            from: "paids",
            localField: "_id",
            foreignField: "paidBy",
            as: "paidByMe",
          },
        },
        {
          $project: {
            email: 1,
            username: 1,
            isVerified: 1,
            isCreator: 1,
            phone: 1,
            created_assets: {
              title: 1,
              description: 1,
              imageurl: 1,
              rawurl: 1,
              price: 1,
              tags: 1,
              category: 1,
              isPaid: 1,
              blocked: 1,
            },
            acc_details: {
              country_code: 1,
              currency: 1,
            },
            paidByMe: {
              assetId: 1,
              paidAt: 1,
            },
          },
        },
      ];
      let user = await User.aggregate(aggregate);
      if (user && Object.keys(user).length) {
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(user));
      }
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (err) {
      console.log(err);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(err));
    }
  },
  userProfilePrivate: async (req, res) => {
    try {
      let user_name = req.params.username;
      let aggregate = [
        {
          $match: { username: user_name },
        },
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "_creatorId",
            as: "created_assets",
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "_id",
            foreignField: "_creatorId",
            as: "acc_details",
          },
        },
        {
          $lookup: {
            from: "paids",
            localField: "_id",
            foreignField: "paidBy",
            as: "paidByMe",
          },
        },
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "flag.flaggerId",
            as: "flaggedByMe",
          },
        },
        {
          $project: {
            email: 1,
            username: 1,
            isVerified: 1,
            isCreator: 1,
            phone: 1,
            created_assets: {
              title: 1,
              description: 1,
              imageurl: 1,
              rawurl: 1,
              price: 1,
              tags: 1,
              category: 1,
              isPaid: 1,
              blocked: 1,
            },
            acc_details: {
              account_name: 1,
              account_number: 1,
              country_code: 1,
              currency: 1,
            },
            paidByMe: {
              assetId: 1,
              paidAt: 1,
            },
            flaggedByMe: {
              title: 1,
              description: 1,
              imageurl: 1,
              price: 1,
              tags: 1,
              category: 1,
            },
          },
        },
      ];
      let user = await User.aggregate(aggregate);
      if (user && Object.keys(user).length) {
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(user));
      }
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (err) {
      console.log(err);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(err));
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
            "data.rawurl": 1,
            "data.price": 1,
            "data.category": 1,
          },
        },
      ];
      let tags = await Asset.aggregate(aggregate);
      if (tags) {
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(tags));
      }
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
    } catch (error) {
      console.log(err);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(err));
    }
  },
};
