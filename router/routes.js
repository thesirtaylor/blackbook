"use strict";

var express = require("express"),
  router = express.Router();
let userSignup = require("../controller/userSignup"),
  userVerifymail = require("../controller/userVerifymail"),
  userAccountSetting = require("../controller/accountSetting"),
  userSignin = require("../controller/userSignin"),
  createAsset = require("../controller/createAsset"),
  asset = require("../lib/assetupload"),
  deleteAsset = require("../controller/deleteAsset"),
  flagAsset = require("../controller/flagAsset"),
  updateTags = require("../controller/updateTags"),
  uuid = require("../util/uuidmidware"),
  payment = require("../controller/payment"),
  subaccountForAsset = require("../controller/fetchAssetSubaccount"),
  country = require("../controller/countries"),
  countryBankData = require("../controller/countryBankData"),
  getRequests = require("../controller/getRequests"),
  getProfile = require("../controller/getprofile"),
  getTransactions = require("../controller/getTransactions"),
  searchAll = require("../controller/searchAll"),
  cache = require("../lib/cache").cache,
  resetPassword = require("../controller/resetPassword");

const verify = require("../lib/jwt").CHECK_TOKEN;

module.exports = function (app) {
  router.get("/", function (req, res) {
    res.send(`BlackStoryBook's Development server
        <br /> |____________________|Our Back-End engineer is mostly clueless 😏 
        <br /> |__________________________________|make love, not war`);
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
  router.put("/api/flag/:id", verify, flagAsset.flag);
  router.put("/api/update/:id", verify, updateTags.update);

  //----------BANK DETAILS RELATED------------------------------------>
  router.post("/api/user/settings/bankdetails", verify, userAccountSetting.setbankdetails);
  router.put("/api/user/settings/updatebankdetails", verify, userAccountSetting.updatebankdetails);
  router.delete(
    "/api/user/settings/deletebankdetails",
    verify,
    userAccountSetting.deletebankdetails
  );
  router.get("/api/asset/:id/paymentSubaccount", verify, subaccountForAsset.subaccountForAsset);

  //--------Form Optimization------------------------------------------>
  router.get("/api/countries", country.country);
  router.get("/api/bankdata", cache, countryBankData.code);

  router.post("/api/user/pay/:id", verify, payment.initialize);
  router.post("/api/payment/webhook", payment.webHook);

  // ----------------Get Requests--------------------------------------->
  router.get("/api/assetsbyTime", getRequests.assetbyTime_un);
  router.get("/api/user/profile/@:username", verify, cache, getProfile.userProfile);
  router.get("/api/log/transactions", verify, cache, getTransactions.transactions);
  router.get("/api/tags", cache, getRequests.assetsByTags);
  router.get("/api/search/:data", cache, searchAll.search);

  app.use(router);
};
