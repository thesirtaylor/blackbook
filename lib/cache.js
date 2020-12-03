const redisClient = require("../lib/redis").redisClient;
const logger = require("../lib/logger");

function cache(req, res, next) {
  // console.log(req.params);
  let  param  = req.params;
  // console.log(param);
  let key = "__express__" + req.originalUrl || req.url;
  redisClient.get(key, (error, cached) => {
    if (error) {
      logger.error(error);
      throw error;
    }
    if (cached != null) {
      res.send(JSON.parse(cached));
    } else {
      next();
    }
  });
}

module.exports = { cache };
