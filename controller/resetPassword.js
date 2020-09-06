
let User = require("../model/users").user,
  PasswordToken = require("../model/users").passwordResetToken,
  ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus"),
  { CREATE_HASH } = require("../lib/bcrypt"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  mailkey = process.env.SENDGRID_API_KEY,
  JWT = require("../lib/jwt");
const EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;


module.exports = {
  sendToken:async (req, res)=>{
      let options  = req.body;
      let _is_error = !EMAIL_REGEX.test(options.email);
      if (_is_error) return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`Properly formatted Email required!`));
      try {
        let user = await User.findOne({ email: options.email });
        if (user) {
          let token = await PasswordToken.findOne({ _userId: user._id });
          if (token) {
            return res.status(HTTP_STATUS.CONFLICT).json(ERR(`The last token you requested hasn't expired, check your email for it.`))
          } else {
            let newToken = await PasswordToken.create({ _userId: user._id, token: crypto.randomBytes.toString("hex") });
            if (newToken) {
              sgMail.setApiKey(mailkey);
              let mail = {
                    from: `no-reply@blackstory.com`,
                    to: options.email,
                    subject: `Password Reset Token`,
                    text: newToken.token,
                    html: `<strong>${newToken.token}</strong>`
                  };
                  let sM = await sgMail.send(mail);
                  if (sM) { return res.status(HTTP_STATUS.OK).json(SUCCESS(`Password reset mail has been sent successfully to ${options.email}`))} 
                  return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(ERR(`Mail sending Failed.`))
            } else {
              return res.status(HTTP_STATUS.CONFLICT).json(ERR(`Creation of new token failed, try again.`));
            }
          }
        } else {
          return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Email not registered`));
        }
      } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
      }
  },
  
  resetPassword: async (req, res) => {
      let options = req.body;
      try {
        let token = await PasswordToken.findOne({ token: options.token });
        if (token) {
          let user = await User.findOne({ _id: token._userId, email: options.email });
          if (user) {
            let hash = await CREATE_HASH(options.password);
            user.password = hash;
            let save = await user.save();
            if (save) {
              token.remove();
              return res.status(HTTP_STATUS.ACCEPTED).json(SUCCESS(`Password successfully changed, Sign in with New Password`))
            }else{return res.status(HTTP_STATUS.NOT_MODIFIED).json(ERR(`Password not successfully changed, try again.`))}
          } else {return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`No account linked to the provided recovery parameters`));}
        } else {
            return res.status(HTTP_STATUS.NOT_FOUND).json(ERR(`Token not recognised`));
        }
      } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(error));
      }
  }
}