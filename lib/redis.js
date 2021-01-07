const redis = require("redis");
var url = require("url");
var redisUrl = url.parse(process.env.REDISCLOUD_URL);
const redisClient = redis.createClient(redisUrl.port, redisUrl.hostname);

redisClient.on("connect", function () {
  console.log("Redis server connected");
});

redisClient.on("error", function (err) {
  console.log("Something went wrong " + err);
});
module.exports = { redisClient };
