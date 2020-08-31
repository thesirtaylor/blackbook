//-----------------------------------------REQUIRE RELEVANT MIDDLEWARES--------------------------------------
//-----------------------------------------                            --------------------------------------
const express = require("express"),
  morgan = require("morgan"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  path = require("path"),
  routes = require("../router/routes");

//---------------------------------------DEFINE AND EXPORT MODULE---------------------------------------------
//---------------------------------------                        ---------------------------------------------
module.exports = function (app) {
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride());
  app.use(allowCrossDomain);
  app.use("/public", express.static(path.join(__dirname, "/images")));

  routes(app);
  return app;
};

//---------------------------------------DEFINE CUSTOM DETAILED CORS------------------------------------------
//---------------------------------------                        ---------------------------------------------

var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Cross-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
