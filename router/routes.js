var express = require('express'),
    router = express.Router();
let userSignup = require('../controller/userSignup'),
    userVerifymail = require('../controller/userVerifymail');

module.exports = function (app){
    router.get('/', function (req, res) {
        res.send('hello world')
      });
    router.post('/api/user/create', userSignup.signup);
    router.post('/api/user/verify', userVerifymail.verify);
    router.post('/api/user/verify-r', userVerifymail.resend);

    app.use(router);
} 