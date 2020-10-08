"use strict";

var express = require('express'),
    router = express.Router();
let userSignup = require("../controller/userSignup"),
  userVerifymail = require("../controller/userVerifymail"),
  userAccountSetting = require("../controller/accountSetting"),
  userSignin = require("../controller/userSignin"),
  createAsset = require("../controller/createAsset"),
  asset = require("../lib/assetupload"),
  deleteAsset = require("../controller/deleteAsset"),
  uuid = require("../util/uuidmidware"),
  resetPassword = require("../controller/resetPassword");
    
const verify = require('../lib/jwt').CHECK_TOKEN;

module.exports = function (app){
    router.get('/', function (req, res) {
        res.send("BlackStoryBook Project \n Welcome to the Development Server \n Our Back-End guy is mostly clueless.")
      });
    router.post('/api/user/create', userSignup.signup);
    router.post('/api/user/verify', userVerifymail.verify);
    router.post('/api/user/verify-r', userVerifymail.resend);
    router.post('/api/user/signin', userSignin.signin);
    router.post('/api/user/sendreset', resetPassword.sendToken);
    router.post('/api/user/passwordreset', resetPassword.reset);


    //---------------------------------------------------------------------------->
    //----------ACTIONS REQUIRE USER LOGGED IN------------------------------------>
    router.put('/api/user/settings/creator', verify, userAccountSetting.isCreator);
    router.post('/api/create', verify, uuid.uuid, asset.array('images', 2),createAsset.create);
    router.delete('/api/delete/:id', verify, deleteAsset.delete);
    app.use(router);
} 