"use strict";

let User = require("../model/users").user,
  Account = require("../model/account").account,
  uuid = require("uuid"),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY;
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
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
      if (user) {
        const payload = {
          account_bank: options.account_bank,
          account_number: options.account_number,
          business_name: options.account_name,
          business_email: user.email,
          business_contact: options.business_contact,
          business_contact_mobile: options.business_contact_mobile,
          business_mobile: options.business_mobile,
          country: options.country, //This is the ISO country code of the merchant e.g. NG, GH, KE etc.
          // meta: [
          //   {
          //     meta_name: "mem_adr",
          //     meta_value: "0x16241F327213",
          //   },
          // ],
          split_type: "percentage",
          split_value: split_value,
        };

        const response = await flw.Subaccount.create(payload);
        if (response) {
          let saveBankDetail = await Account.create({
            account_bank: response.data.account_bank,
            account_number: response.data.account_number,
            account_name: response.data.full_name,
            account_id: response.data.id,
            subaccount_id: response.data.subaccount_id,
            _userId: user._id,
          });
          if (saveBankDetail) {
            return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(saveBankDetail));
          } else {
            return res
              .status(HTTP_STATUS.PRECONDITION_REQUIRED)
              .json(ERR(`Error encountered while attempting to save account details`));
          }
        } else {
          return res
            .status(HTTP_STATUS.PRECONDITION_REQUIRED)
            .json(ERR(`Error encountered while attempting to create account details`));
        }
      } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },

  updatebankdetails: async (req, res) => {
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let account = await Account.findOne({ _userId: user._id });
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
          account_bank: options.account_bank,
          account_number: options.account_number,
          split_type: "percentage",
          split_value: split_value,
        };
        const response = await flw.Subaccount.update(payload);
        if (response) {
          const update = await Account.updateOne({ _userId: user._id }, { $set: {
            account_bank:response.data.account_bank,
            account_number: response.data.account_number,
            account_name: response.data.business_name,
          } });
          if(update){
              return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(response));
          }else{
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
    let options = req.body;
    let payload = req.decoded;
    try {
      let user = await User.findOne({ _id: payload.user });
      let account = await Account.findOne({ _userId: user._id });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
      }
      if (!account) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account don't exist.`));
      }
      if (user && account) {
        const payload = {
          id: account.account_id, //This is the unique id of the subaccount you want to update. It is returned in the call to create a subaccount as data.id
        };
        const response = await flw.Subaccount.delete(payload);
        if (response) {
          let deleteAcc = await account.remove();
          if (deleteAcc) {
              return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(`Account details successfully removed.`));
          } else {
              return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account removal operation failed.`));            
          }
        }else{
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`Account deletion failed`));
        }
      } else {
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
    }
  },
};
