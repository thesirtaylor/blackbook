var express = require('express'),
    router = express.Router();
let user = require('../controller/user');

module.exports = function (app){
    router.get('/', function (req, res) {
        res.send('hello world')
      });
    router.post('/api/user/create', user.signup)

    app.use(router);
} 