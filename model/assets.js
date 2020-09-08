"use strict";
let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let assetModel = new Schema({
  title: { type: String, required: true },
  desc: { type: String },
  image: { type: String, required: true },
  raw: { type: String },
  price: { type: Number, required: true },
  tags: {
    type:[{ type: String, required: true }],
    validate: [limit, `{PATH} exceeds the limit of 5`]
  },
  createdAt: { type: Date, required: true, default: Date.now },
  _userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  isDownloaded: { type: Boolean, default: false, required: true, },
});

function limit(val){
  return val.length <= 5;
};

let downloadModel = new Schema({
  assetId: { type: Schema.Types.ObjectId, ref: "asset", required: true },
  downloadedBy: { type: Schema.Types.ObjectId, ref: "user" },
  downloadedAt: { type: Date, default: Date.now, required: true },
});

let asset = mongoose.model("assest", assetModel);
let downloaded = mongoose.model("downloaded", downloadModel);

module.exports = {
  asset: asset,
  downloaded: downloaded,
};