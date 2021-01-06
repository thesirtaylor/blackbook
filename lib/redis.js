// const redis = require("redis");
// const url = require('url');
// const redisUrl = url.parse("redis://localhost:6379");
// const redisClient = redis.createClient(redisUrl.port, redisUrl.hostname);

// module.exports = { redisClient };

// redisClient.on("connect", function () {
//   console.log("Redis server connected");
// });

// redisClient.on("error", function (err) {
//   console.log("Something went wrong " + err);
// });

// var kue = require("kue"),
//   url = require("url"),
//   redis = require("kue/node_modules/redis");

// // make sure we use the Heroku Redis To Go URL
// // (put REDISTOGO_URL=redis://localhost:6379 in .env for local testing)

// kue.redis.createClient = function () {
//   var redisUrl = url.parse(process.env.REDISTOGO_URL),
//     client = redis.createClient(redisUrl.port, redisUrl.hostname);
//   if (redisUrl.auth) {
//     client.auth(redisUrl.auth.split(":")[1]);
//   }
//   return client;
// };