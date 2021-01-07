const redis = require("redis");
var url = require("url");
var redisUrl = url.parse(process.env.REDISTOGO_URL);
const password = redisUrl.auth.split(":")[1];
const redisClient = redis.createClient({
  port: redisUrl.port,
  host: redisUrl.hostname,
  no_ready_check: true,
  auth_pass: password,
});

redisClient.on("connect", function () {
  console.log("Redis server connected");
});

redisClient.on("error", function (err) {
  console.log("Something went wrong " + err);
});
module.exports = { redisClient };
