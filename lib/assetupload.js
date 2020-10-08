"use strict";

const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: "us-east-2",
});

let filter = (req, file, cb) => {
  let arr = [
    "image/png",
    "image/jpeg",
    "image/x-x3f",
    "image/jpg",
    "image/ svg+xml",
    "image/tiff",
    "image/ bmp",
    "image/vnd-adobe.photoshop",
    "image/3fr",
    "image/x-fff",
    "image/arw",
    "image/sr2",
    "image/x-raw",
    "image/x-bay",
    "image/x-raw-phaseone",
    "image/x-iiq",
    "image/x-eip",
    "image/x-dcs",
    "image/x-drf",
    "image/x-dcr",
    "image/x-k25",
    "image/x-kdc",
    "image/x-dng",
    "image/x-erf",
    "image/x-mef",
    "image/x-nef",
    "image/x-nrw",
    "image/x-pef",
    "image/x-pxn",
    "image/x-r3d",
    "image/x-rwl",
    "image/x-rwz",
  ];

  if (
    arr.indexOf(file.mimetype) !== -1 ||
    file.originalname.match(
      /\.(ari|cr2|rwz|raf|rw2|srf|mos|mfw|crw|orf|cr3|srw|j6i|kc2|cs1|mrw|cxi|mdc)$/
    )
  ) {
    return cb(null, true);
  } else {
    cb({ message: "unsupported file format" }, false);
  }
};

let upload = multer({
  fileFilter: filter,
  limits: { fileSize: 1024 * 1024 * 50 },
  storage: multerS3({
    s3: s3,
    bucket: "blackbook-dirty-bucket",
    acl: "public-read",
    storageClass: "STANDARD",
    key: function (req, file, cb) {
      let uuid = req.uuid;
      let tit = req.body.title;
      let title = tit.replace(/\s+/g, "-");
      let key = `${uuid}/${title}/${file.originalname}`;
      let exists = req.keys.indexOf(key) + 1;
      if (!exists) {
        cb(null, `${uuid}/${title}/${file.originalname}`);
      } else {
        cb("Cannot upload duplicate files", false);
      }
    },
  }),
});
module.exports = upload;
