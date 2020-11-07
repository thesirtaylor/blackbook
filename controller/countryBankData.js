"use strict";

let axios = require("axios").default,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  code: async (req, res) => {
    let options = req.body;
    try {
      const option = {
        //get options.country from /api/countries endpoint
        url: `https://api.flutterwave.com/v3/banks/${options.country}`,
      };
      const head = {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRETKEY}`,
          "Content-Type": "application/json",
        },
      };
      let accountCodes = await axios.get(option.url, head);
      if (!accountCodes) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No Data for this country`));
      }
      console.log(accountCodes.data.data);
      return res.status(HTTP_STATUS.FOUND).json(SUCCESS(accountCodes.data));
    } catch (error) {
      console.log(error.response.data);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error.response.data));
    }
  },
};
