"use strict";

var cloudinary = require('cloudinary').v2;
const ERR = require("../util/error"),
  SUCCESS = require("../util/success"),
  HTTP_STATUS = require("../util/httpstatus");

module.exports = {
  upload: (file, folderPath)=>{
    cloudinary.config({
      cloud_name: "genkin",
      api_key: process.env.CLOUDINARYKEY,
      api_secret: process.env.CLOUDINARYSECRET,
    });

    return new Promise(async (resolve, reject) => {
      try {
        let cloud = await cloudinary.uploader.upload(file, 
          {folder: folderPath,
            resource_type: "auto"});
          if(cloud){
            return resolve(cloud);
          }else{
            return reject(()=>res.status(HTTP_STATUS.BAD_REQUEST).json(ERR(`BAD REQUEST`)));
          }
      } catch (error) {
        return reject(error);
      }
    })
  }
}