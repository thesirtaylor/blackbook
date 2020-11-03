"use strict";

let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let accountModel = new Schema({
  account_bank: {
    type: String,
    required: true,
  },
  account_number: {
    type: String,
    required: true,
  },
  account_name: {
    type: String,
    required: true,
  },
  account_id: {
    type: Number,
    required: true,
  },
  subaccount_id: {
    type: String,
    required: true,
  },
  _creatorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  //paystack details
  
});

let account = mongoose.model("account", accountModel);

module.exports = {
  account: account,
};
