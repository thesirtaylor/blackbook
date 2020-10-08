"use strict";

//add image flaging
let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let assetModel = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  uploadresponse: { type: Array, required: true },
  imageurl: { type: String, required: true },
  rawurl: { type: String, required: true, default: "abc" }, //remove deafult when we have testing file
  rawkey: { type: String, required: true, default: "abc" },
  imagekey: { type: String, required: true },
  price: { type: Number, required: true },
  tags: {
    type: [{ type: String, required: true }],
    validate: [limit, `{PATH} exceeds the limit of 5`],
  },
  createdAt: { type: Date, required: true, default: Date.now },
  _userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  isPaid: { type: Boolean, default: false, required: true },
});

function limit(val){
  return val.length <= 5;
};

let downloadModel = new Schema({
  assetId: { type: Schema.Types.ObjectId, ref: "asset", required: true },
  paidBy: { type: Schema.Types.ObjectId, ref: "user" },
  paidAt: { type: Date, default: Date.now, required: true },
});

let asset = mongoose.model("assest", assetModel);
let downloaded = mongoose.model("downloaded", downloadModel);

module.exports = {
  asset: asset,
  downloaded: downloaded,
};


//loop through the array, if the the last 3 characters aren't of format image, 
//map push that link into raw field, leave the rest in image.