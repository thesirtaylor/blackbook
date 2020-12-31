"use strict";

let User = require("../model/users").user,
  Token = require("../model/users").verificationToken,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  logger = require("../lib/logger"),
  HTTP_STATUS = require("../util/httpstatus"),
  { CREATE_HASH } = require("../lib/bcrypt"),
  { SIGNIN_REQ_VALIDATOR, SIGNUP_REQ_VALIDATOR } = require("../util/validator"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY;

module.exports = {
  signup: async (req, res) => {
    let options = req.body;
    let _is_error = SIGNUP_REQ_VALIDATOR(options);
    if (_is_error) return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`Bad signup Parameters`));
    try {
      let user = await User.findOne({
        $or: [{ username: options.username }, { email: options.email }],
      });
      if (user) {
        logger.info(`Username or Email already in use.`);
        return res.status(HTTP_STATUS.RESERVED).json(ERR(`Username or Email already in use.`));
      } else {
        let hashword = await CREATE_HASH(options.password);
        let user_ = await User.create({
          email: options.email,
          username: options.username,
          password: hashword,
        });
        if (user_) {
          let token = await Token.create({
            _userId: user_.id,
            token: crypto.randomBytes(16).toString("hex"),
          });
          if (token) {
            sgMail.setApiKey(mailkey);
            let mail = {
              from: `no-reply@blackstory.com`,
              to: options.email,
              subject: `Account Verification Token`,
              text: token.token,
              html: `<strong>${token.token}</strong>`,
            };
            let sM = await sgMail.send(mail);
            if (sM) {
              return res
                .status(HTTP_STATUS.OK)
                .json(SUCCESS("Verification mail has been sent successfully to " + req.body.email));
            }
            logger.info(`Mail sending Failed.`);
            return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(ERR(`Mail sending Failed.`));
          }
        } else {
          logger.info(`Error encountered while attempting to create new user.`);
          return res
            .status(HTTP_STATUS.NOT_IMPLEMENTED)
            .json(ERR(`Error encountered while attempting to create new user.`));
        }
      }
    } catch (error) {
      console.log(error);
      logger.error(`${error}`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
    }
  },
};
