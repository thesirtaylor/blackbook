const redis = require("redis");
const url = require('url');
const redisUrl = url.parse(process.env.REDISTOGO_URL);
const redisClient = redis.createClient(redisUrl.port, redisUrl.hostname);

module.exports = { redisClient };

redisClient.on("connect", function () {
  console.log("Redis server connected");
});

redisClient.on("error", function (err) {
  console.log("Something went wrong " + err);
});
