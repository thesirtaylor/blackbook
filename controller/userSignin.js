"use strict";

let User = require("../model/users").user,
  Token = require("../model/users").verificationToken,
  PasswordToken = require("../model/users").passwordResetToken,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  logger = require("../lib/logger"),
  { SIGNIN_REQ_VALIDATOR, SIGNUP_REQ_VALIDATOR } = require("../util/validator"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY,
  { SIGN_TOKEN } = require("../lib/jwt");
const bcrypt = require("bcryptjs");
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

module.exports = {
  signin: async (req, res) => {
    let options = req.body;
    // let _is_error = SIGNIN_REQ_VALIDATOR(options);
    // if(_is_error) return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`Bad signin Parameters`));
    try {
      let user = await User.findOne({ $or: [{ email: options.data }, { username: options.data }] });
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            ERR(
              `This sign in parameter is not associated with any account. Check, re-type, and try again.`
            )
          );
      } else {
        let compare = await bcrypt.compare(options.password, user.password);
        if (!compare) {
          return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Incorrect Password.`));
        } else {
          if (!user.isVerified) {
            logger.info(`Can't sign in until email has been Verified.`);
            return res
              .status(HTTP_STATUS.NOT_FOUND)
              .json(ERR(`Can't sign in until email has been Verified.`));
          } else {
            let sign = await SIGN_TOKEN({ user: user._id });
            if (sign) {
              return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(sign));
            } else {
              logger.info(`No token signed.`);
              return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json(ERR(`No token signed.`));
            }
          }
        }
      }
    } catch (error) {
      logger.error(`${error}`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
    }
  },
};
