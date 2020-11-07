"use strict";

let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let userModel = new Schema({
  email: {
    type: String,
    required: true,
    index: { unique: true },
  },
  username: {
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  uuid: {
    type: String,
    required: false,
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  phone:{
    type: Number,
  }
});

let tokenModel = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200,
  }, //expires after 12 hours
});

let passwordResetModel = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200,
  },
});

let user = mongoose.model("user", userModel);
let verificationToken = mongoose.model("verificationToken", tokenModel);
let passwordResetToken = mongoose.model("passwordReset", passwordResetModel);

module.exports = {
  user: user,
  verificationToken: verificationToken,
  passwordResetToken: passwordResetToken,
};
