"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  country: (req, res) => {
    let data = [
      {
        name: "Ghana",
        code: "GH",
        currency: "GHS",
      },
      {
        name: "Kenya",
        code: "KH",
        currency: "KES",
      },
      {
        name: "Nigeria",
        code: "NG",
        currency: "NGN",
      },
      {
        name: "Uganda",
        code: "UG",
        currency: "UGX",
      },
      {
        name: "USA",
        code: "US",
        currency: "USD",
      },
      {
        name: "South Africa",
        code: "ZA",
        currency: "ZAR",
      },
      {
        name: "Tanzania",
        code: "TZ",
        currency: "TZS",
      },
    ];
    return res.status(HTTP_STATUS.FOUND).json(SUCCESS(data));
  },
};
