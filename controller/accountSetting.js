"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  uuid = require("uuid"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.FLW_PUBLICKEY, process.env.FLW_SECRETKEY);
const split_value = 0.25;

module.exports = {
  isCreator: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      if (user) {
        user.isCreator = options.data;
        user.uuid = user.uuid ? user.uuid : uuid.v4();
        let save = await user.save();
        if (save) {
          //send mail to welcome creator and explain isCreator priviledges
          return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(user));
        } else {
          return res
            .status(HTTP_STATUS.NOT_IMPLEMENTED)
            .json(ERR(`Turning on Creator Status was unsuccessful`));
        }
      } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
    } catch (error) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },

  setbankdetails: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let account = await Account.findOne({
        _creatorId: user._id,
        account_number: options.account_number,
      });
      if (user && !account) {
        const payload = {
          //get data dynamically from /api/bankData endpoint
          account_bank: options.account_bank,
          account_number: options.account_number,
          business_name: options.account_name,
          business_email: user.email,
          business_contact: options.business_contact,
          business_contact_mobile: options.business_contact_mobile,
          business_mobile: options.business_mobile,
          //This is the ISO country code of the merchant e.g. NG, GH, KE etc.
          //get data dynamically from /api/countries endpoint
          country: options.country_code,
          meta: [
            //require swift code if country isn't Nigeria or Kenya
            //require routing number if country is USA
            {
              meta_name: "SWIFT Code",
              meta_value: options.swift_code,
            },
            {
              meta_name: "Routing Number",
              meta_value: options.routing_number,
            },
          ],
          split_type: "percentage",
          split_value: split_value,
        };

        const response = await flw.Subaccount.create(payload);
        // console.log(response);
        if (!response) {
          return res
            .status(HTTP_STATUS.NOT_ACCEPTABLE)
            .json(ERR(`Error encountered while attempting to create account details`));
        }
        if (response) {
          if (response.status === "error") {
            return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json(ERR(response.message));
          }
          let saveBankDetail = await Account.create({
            account_bank: response.data.account_bank,
            account_number: response.data.account_number,
            account_name: response.data.full_name,
            account_id: response.data.id,
            subaccount_id: response.data.subaccount_id,
            _creatorId: user._id,
            //get data dynamically from /api/countries endpoint
            currency: options.currency,
            country_code: options.country_code,
          });
          if (!saveBankDetail) {
            return res
              .status(HTTP_STATUS.NOT_ACCEPTABLE)
              .json(ERR(`Error encountered while attempting to save account details`));
          }
          return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(saveBankDetail));
        }
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ERR(`We have your account details already`));
      }
    } catch (error) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },

  updatebankdetails: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let account = await Account.findOne({ _creatorId: user._id });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      if (!account) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Unassigned`));
      }
      if (user && account) {
        const payload = {
          id: account.account_id,
          business_name: options.account_name,
          business_email: options.email,
          //get data dynamically from /api/bankData endpoint
          account_bank: options.account_bank,
          //-------------------------------------------
          account_number: options.account_number,
          split_type: "percentage",
          split_value: split_value,
        };
        const response = await flw.Subaccount.update(payload);
        if (response) {
          const update = await Account.updateOne(
            { _creatorId: user._id },
            {
              $set: {
                account_bank: response.data.account_bank,
                account_number: response.data.account_number,
                account_name: response.data.business_name,
              },
            }
          );
          if (update) {
            return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(response));
          } else {
            return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(`Db optimization failed`));
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
  deletebankdetails: async (req, res) => {
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let account = await Account.findOne({ _creatorId: user._id });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      if (!account) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account don't exist.`));
      }
      if (user && account) {
        const payload = {
          id: account.account_id,
        };
        const response = await flw.Subaccount.delete(payload);
        if (!response) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account deletion failed`));
        }
        let deleteAcc = await account.remove();
        if (!deleteAcc) {
          return res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json(ERR(`Account removal operation failed.`));
        }
        return res
          .status(HTTP_STATUS.ACCEPTED)
          .json(SUCCESS(`Account details successfully removed.`));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
