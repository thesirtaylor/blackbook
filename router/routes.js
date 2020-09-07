var express = require('express'),
    router = express.Router();
let userSignup = require('../controller/userSignup'),
    userVerifymail = require('../controller/userVerifymail'),
    mailtemplate = require('../util/mailTemplate'),
    userAccountSetting = require('../controller/accountSetting'),
    userSignin = require('../controller/userSignin'),
    resetPassword = require('../controller/resetPassword');
    
const verify = require('../lib/jwt').CHECK_TOKEN;

module.exports = function (app){
    router.get('/', function (req, res) {
        res.send("BlackStoryBook Project \n Welcome to the Development Server \n Say a Prayer for us.")
      });
    router.post('/api/user/create', userSignup.signup);
    router.post('/api/user/verify', userVerifymail.verify);
    router.post('/api/user/verify-r', userVerifymail.resend);
    router.post('/api/user/signin', userSignin.signin);
    router.post('/api/user/sendreset', resetPassword.sendToken);
    router.post('/api/user/passwordreset', resetPassword.reset);


    //---------------------------------------------------------------------------->
    //----------ACTIONS REQUIRE USER LOGGED IN------------------------------------>
    router.post('/api/user/settings/creator', verify, userAccountSetting.isCreator);

    app.use(router);
} 