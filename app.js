var dotenv = require ('dotenv');
    dotenv.config();
var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    configure = require('./server/configure')