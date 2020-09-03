let dotenv = require ('dotenv');
    dotenv.config();
let express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    configure = require('./server/configure'),
    mongo = process.env.MONGODB;


//------------------------------------------------------------------SET APP MIDDLEWARE PARAMETER-----------------------------------------------//
//------------------------------------------------------------------                            -----------------------------------------------//
    app.set('view', __dirname+'/view')//google how to set view path
    app.set('port', process.env.PORT||1010)//google how to set dynamic port
    app = configure(app);

//-----------------------------------------------------------------CONNECT to MONGOOSE---------------------------------------------------------//
//-----------------------------------------------------------------                   ---------------------------------------------------------//
mongoose.Promise = global.Promise
let urli = 'mongodb://127.0.0.1:27017/blackbook';
mongoose
  .connect(
    "mongodb+srv://blackstoryorbook:mRDB4YLSZGffeFyo@blackstory.cxphh.mongodb.net/<blackbook>?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log("Mongoose Online!");
    app.listen(app.get("port"), function () {
      console.log("On Port " + app.get("port"));
    });
  })
  .catch((error) => console.log(error));