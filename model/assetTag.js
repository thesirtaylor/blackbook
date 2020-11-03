"use strict";
let mongoose = require("mongoose"),
    Schema = mongoose.Schema;

let tagSchema = new Schema({
    tag: {type: String, required: true},
    asset: {type: Schema.Types.ObjectId, required: true}
});

let tag = mongoose.model('tag', tagSchema);

module.exports = {
  tag: tag
}