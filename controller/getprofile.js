"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  User = require("../model/users").user,
  Asset = require("../model/assets").asset,
  Paid = require("../model/assets").paid,
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  userProfile: async (req, res) => {
    let payload = req.decoded;
    let userparam = req.params.username;
    try {
      let signed_user = await User.findOne({ _id: payload.user }).select({ username: 1 });
      let allUsers = await User.findOne({ username: userparam }).select({ username: 1 });
      if (!allUsers) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No data`));
      }
      if (signed_user.username !== userparam) {
                  let aggregate = [
                    {
                      $match: { username: userparam },
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
                        from: "assets",
                        localField: "_id",
                        foreignField: "_buyerId",
                        as: "bought_assets",
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
                          // rawurl: 1,
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
                        bought_assets: {
                          title: 1,
                          description: 1,
                          imageurl: 1,
                          // rawurl: 1,
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
      }
      if (signed_user.username === userparam) {
                  let aggregate = [
                    {
                      $match: { username: userparam },
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
                        from: "assets",
                        localField: "_id",
                        foreignField: "_buyerId",
                        as: "bought_assets",
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
                          // rawurl: 1,
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
                        bought_assets: {
                          title: 1,
                          description: 1,
                          imageurl: 1,
                          // rawurl: 1,
                          price: 1,
                          tags: 1,
                          category: 1,
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
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
    }
  },
};
