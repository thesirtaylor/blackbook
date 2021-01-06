const redis = require("redis");
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient(REDIS_PORT);

module.exports = { redisClient };

redisClient.on("connect", function () {
  console.log("Redis server connected");
});

redisClient.on("error", function (err) {
  console.log("Something went wrong " + err);
});
