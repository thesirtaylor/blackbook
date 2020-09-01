let User = require("../model/users").user,
  Token = require("../model/users").verificationToken,
  PasswordToken = require("../model/users").passwordResetToken,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  { CREATE_HASH, BCRYPT_COMPARE } = require("../lib/bcrypt"),
  { SIGNIN_REQ_VALIDATOR, SIGNUP_REQ_VALIDATOR } = require("../util/validator"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY,
  JWT = require("../lib/jwt");
  const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;



  module.exports = {
    verify: async (req, res) => {
      let options = req.body;
      let _is_error = !EMAIL_REGEX.test(options.email);
      if(_is_error) return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`Email required!`));
      try {
          let token = await Token.findOne({ token: options.token });
            if (token) {
                let user = await User.findOne({ _id: token._userId, email: options.email });
                  if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Token not linked to any Account`))
                  else{
                    if (user.isVerified === true) return res.status(HTTP_STATUS.CONFLICT).json(ERR(`User has been verified already`))
                    else {user.isVerified = true};
                    let save = await user.save();
                    if (save) return res.status(HTTP_STATUS.OK).json(SUCCESS(`Account Verified, proceed to Sign in.`));
                  }
                  token.remove();
            } else return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Token not found, request another.`)) 
      } catch (error) {
                console.log(error);
        return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
      }
    },
    resend: async (req, res)=> {
      let options = req.body;
      let _is_error = !EMAIL_REGEX.test(options.email);
      if (_is_error) return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`Properly formatted Email required!`));
      try {
        let user = await User.findOne({ email: options.email });
          if(!user) return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Email not signed up, we can't send token to an unknown email`));
          if(user.isVerified) return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json(ERR(`This account has been verified.`));
          else{
              let token = await Token.findOne({_userId: user._id});
              if (token) return res.status(HTTP_STATUS.FORBIDDEN).json(ERR(`The last token you requsted hasn't expired. Check your email for it.`));
              let recreate = await Token.create({_userId: user._id, token: crypto.randomBytes(16).toString("hex")});
              if (recreate) {
                  sgMail.setApiKey(mailkey);
                  let mail = {
                    from: `no-reply@blackstory.com`,
                    to: options.email,
                    subject: `Account Verification Token`,
                    text: recreate.token,
                    html: `<strong>${recreate.token}</strong>`
                  };
                  let sM = await sgMail.send(mail);
                  if (sM) { return res.status(HTTP_STATUS.OK).json(SUCCESS("Verification mail has been sent successfully to " + req.body.email))} 
                  return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(ERR(`Mail sending Failed.`))
                }
          } 
      } catch (error) {
                console.log(error);
        return res.status(HTTP_STATUS.EXPECTATION_FAILED).json(ERR(error));
      }
    }
  }