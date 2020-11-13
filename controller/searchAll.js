"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  HTTP_STATUS = require("../util/httpstatus");

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
          $unwind: "$creator"
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
      if (resp) {
        console.log(resp);
        return res.status(HTTP_STATUS.FOUND).json(SUCCESS(resp));
      }
      return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Nothing found`));
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
};
