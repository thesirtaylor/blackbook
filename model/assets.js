"use strict";

let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let assetModel = new Schema({
  title: { type: String, required: true, index: { unique: false } },
  description: { type: String },
  uploadresponse: { type: Array, required: true },
  imageurl: { type: String, required: true },
  rawurl: { type: String, required: true }, //remove deafult when we have testing file
  rawkey: { type: String, required: true },
  imagekey: { type: String, required: true },
  price: { type: Number, required: true },
  tags: { type: Array, required: true },
  category: { type: String, required: true, index: { unique: false } },
  createdAt: { type: Date, required: true, default: Date.now },
  _creatorId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  _buyerId: { type: Schema.Types.ObjectId, ref: "user" },
  isPaid: { type: Boolean, default: false, required: true },
  flag: [
    {
      flaggerId: { type: Schema.Types.ObjectId, ref: "user" },
      reason: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  blocked: {
    type: Boolean,
    default: false,
  },
});
// let paidModel = new Schema({
//   assetId: { type: Schema.Types.ObjectId, ref: "asset", required: true },
//   paidBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
//   paymentRes: { type: Object },
//   paidAt: { type: Date, default: Date.now, required: true },
// });

let asset = mongoose.model("asset", assetModel);
// let paid = mongoose.model("paid", paidModel);

module.exports = {
  asset: asset,
  // paid: paid,
};
