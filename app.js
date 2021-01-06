"use strict";

let dotenv = require("dotenv");
dotenv.config();
let express = require("express"),
  mongoose = require("mongoose"),
  logger = require("./lib/logger"),
  app = express(),
  kue = require("kue"),
  url = require("url"),
  redis = require("kue/node_modules/redis"),
  configure = require("./server/configure");

function logtime() {
  const date = new Date();
  const conDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} [${date.getHours()}:${date.getMinutes()}]`;
  return conDate;
}
//------------------------------------------------------------------SET APP MIDDLEWARE PARAMETER-----------------------------------------------//
//------------------------------------------------------------------                            -----------------------------------------------//

kue.redis.createClient = function () {
  var redisUrl = url.parse(process.env.REDISTOGO_URL),
    client = redis.createClient(redisUrl.port, redisUrl.hostname);
  if (redisUrl.auth) {
    client.auth(redisUrl.auth.split(":")[1]);
  }
  return client;
};

app.set("view", __dirname + "/view"); //google how to set view path
app.set("port", process.env.PORT || 1010); //google how to set dynamic port
app.use(kue.app);
app = configure(app);

//-----------------------------------------------------------------CONNECT to MONGOOSE---------------------------------------------------------//
//-----------------------------------------------------------------                   ---------------------------------------------------------//
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Mongoose Online!");
    app.listen(app.get("port"), function () {
      console.log("On Port " + app.get("port") + "\n" + logtime());
    });
  })
  .catch((error) => {
    logger.error(error);
    console.log(error);
  });
