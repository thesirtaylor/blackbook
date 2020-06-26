//-----------------------------------------REQUIRE RELEVANT MIDDLEWARES--------------------------------------
//-----------------------------------------                            --------------------------------------
var express = require('express'),
    path = require('path'),
    route = require('./routes'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    cors = require('cors');

//---------------------------------------DEFINE AND EXPORT MODULE---------------------------------------------
//---------------------------------------                        ---------------------------------------------
module.exports = function(app){
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}))
    app.use()




    route(app);
    return app;
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Cross-Origin','*');
    res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');

    next()
}