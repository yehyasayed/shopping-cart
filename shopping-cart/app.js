var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const Hbs = require("handlebars");
const expressHbs = require("express-handlebars");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// database

mongoose.connect( 'mongodb://localhost/shopping-cart' , (error)=>{} ); 

// config passport
require('./config/passport');


// view engine setup
app.engine('hbs', expressHbs({defaultLayout: 'layout' , handlebars:allowInsecurePrototypeAccess(Hbs), extname: 'hbs' , helpers : {
  index : function(value){return value+1},
  checkQuantity : function (value) { if(value>1) return true; else return false; },
  Pagination : function(arr) {
    let size = 6;
    let currentPage = arr[0];
    let sizePages = arr[1];
    let url = arr[2];
    let list ='<nav>';
      list+='<ul class="pagination">';
        if( currentPage == 0 )
        {
          list+='<li class="page-item disabled"><a class="page-link Previous" href="#">Previous</a></li>';
        }else{
          list+='<li class="page-item"><a class="page-link Previous" href="'+url+'?page='+(currentPage-1)+'&size='+size+'">Previous</a></li>';
        }

        for( var i=0 ; i < sizePages ; i++ ){
          if( currentPage == i )
          {
            list+='<li class="page-item active"><a class="page-link" href="'+url+'?page='+i+'&size='+size+'">'+ (i+1) +'</a></li>';
          }else{
            list+='<li class="page-item"><a class="page-link" href="'+url+'?page='+i+'&size='+size+'">'+ (i+1) +'</a></li>';
          }
        }

        if( currentPage+1 == sizePages ){
          list+='<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>';
        }else{
          list+='<li class="page-item"><a class="page-link next" href="'+url+'?page='+(currentPage+1)+'&size='+size+'">Next</a></li>';
        }
      list+='</ul>';
    list+='</nav>';

    return list;
  },
}}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession ( { secret : 'yehya' , saveUninitialized : false , resave : true} ) );
app.use( flash() );
app.use( passport.initialize() );
app.use( passport.session() );
app.use(express.static(path.join(__dirname, 'public')));


// router 
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
