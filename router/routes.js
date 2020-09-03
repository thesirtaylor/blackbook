var express = require('express'),
    router = express.Router();
let userSignup = require('../controller/userSignup'),
    userVerifymail = require('../controller/userVerifymail'),
    userAccountSetting = require('../controller/accountSetting'),
    userSignin = require('../controller/userSignin');
const verify = require('../lib/jwt').CHECK_TOKEN;

module.exports = function (app){
    router.get('/', function (req, res) {
        res.send('hello world')
      });
    router.post('/api/user/create', userSignup.signup);
    router.post('/api/user/verify', userVerifymail.verify);
    router.post('/api/user/verify-r', userVerifymail.resend);
    router.post('/api/user/signin', userSignin.signin);
    router.post('/api/user/settings/creator', verify, userAccountSetting.isCreator);

    app.use(router);
} 