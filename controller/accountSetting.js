"use strict";

let User = require("../model/users").user,
  uuid = require('uuid'),
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY;
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;



module.exports = {
  isCreator: async (req, res) => {
      let options  = req.body;
      let payload = req.decoded;
      try {
        let user = await User.findOne({_id: payload.user});
        if(user){
            user.isCreator = options.data;
            user.uuid = user.uuid ? user.uuid: uuid.v4(); 
            let save = await user.save();
            if (save) {
              //send mail to welcome creator and explain isCreator priviledges
              return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(user));
            }else{
              return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json(ERR(`Turning on Creator Status was unsuccessful`))
            }
        }else{
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
        }
      } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
      }
  },

  setbankdetails: async (req, res) => {
      let options = req.body;
      let payload  = req.decoded;
      try {
        let user  = await User.findOne({_id: payload.user});
        if(user){

        }else{
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
        }
      } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
      }
  },

updatebankdetails: async (req, res) => {
      let options = req.body;
      let payload  = req.decoded;
      try {
        let user  = await User.findOne({_id: payload.user});
        if(user){

        }else{
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(`UNAUTHORIZED`));
        }
      } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(ERR(error));
      }
  },
}