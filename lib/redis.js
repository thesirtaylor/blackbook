const redis = require("redis");
const url = require('url');
const redisUrl = url.parse('redis://127.0.0.1:6379');
const redisClient = redis.createClient(redisUrl.port, redisUrl.hostname);

module.exports = { redisClient };

redisClient.on("connect", function () {
  console.log("Redis server connected");
});

redisClient.on("error", function (err) {
  console.log("Something went wrong " + err);
});
