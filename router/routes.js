var express = require('express'),
    router = express.Router();


module.exports = function (app){
    router.get('/', function (req, res) {
        res.send('hello world')
      });

    app.use(router);
}