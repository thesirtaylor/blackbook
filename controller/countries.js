"use strict";
let ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");
let logger = require("../lib/logger").logger;
const date = new Date();
function datee() {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} [${date.getHours()}:${date.getMinutes()}]`;
}

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
    logger.log(datee(), data)
    return res.status(HTTP_STATUS.FOUND).json(SUCCESS(data));
  },
};
