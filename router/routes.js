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
  payment = require("../controller/payment"),
  subaccountForAsset = require("../controller/fetchAssetSubaccount"),
  resetPassword = require("../controller/resetPassword");
    
const verify = require('../lib/jwt').CHECK_TOKEN;

module.exports = function (app){
  router.get("/", function (req, res) {
    res.send(`BlackStoryBook Project Development server
        <br /> ____________________Our Back-End engineer is mostly clueless 😏 
        <br /> __________________________________make love, not war`);
  });
  router.post("/api/user/create", userSignup.signup);
  router.post("/api/user/verify", userVerifymail.verify);
  router.post("/api/user/verify-r", userVerifymail.resend);
  router.post("/api/user/signin", userSignin.signin);
  router.post("/api/user/sendreset", resetPassword.sendToken);
  router.post("/api/user/passwordreset", resetPassword.reset);

  //----------------------------------------------------------------------------> 

  //----------ACTIONS REQUIRE USER LOGGED IN------------------------------------>
  router.put("/api/user/settings/creator", verify, userAccountSetting.isCreator);
  router.post("/api/create", verify, uuid.uuid, asset.array("images", 2), createAsset.create); 
  router.delete("/api/delete/:id", verify, deleteAsset.delete);

  //----------BANK DETAILS RELATED------------------------------------>
  router.post("/api/user/settings/bankdetails", verify, userAccountSetting.setbankdetails);
  router.put("/api/user/settings/updatebankdetails", verify, userAccountSetting.updatebankdetails);
  router.delete("/api/user/settings/deletebankdetails", verify, userAccountSetting.deletebankdetails);
  router.get("/api/asset/:id/paymentSubaccount", verify, subaccountForAsset.subaccountForAsset);

  router.post("/api/user/pay/:gateway/:id", verify, payment.initialize);
  // router.post("/api/payment/webhook", payment.webHook);
//--paystack test endpoints
  app.use(router);
} 