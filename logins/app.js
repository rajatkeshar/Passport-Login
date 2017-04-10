var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var mongo = require('mongodb');
var FacebookStrategy = require('passport-facebook');
var MongoStore = require('connect-mongo')(session);
var configAuth = require('./config/auth');

mongoose.connect("mongodb://localhost/login");
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
//set view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:false					
}));

//set static folder
app.use(express.static(__dirname +'/public'));

//express session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({mongooseConnection: db}),
	ttl: 2 * 24 * 60 * 60
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;
 
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect flash
app.use(flash());

app.use(function(req, res, next) {
	console.log("req.session: " +JSON.stringify(req.session));
	console.log("+++++++++++++++++++++++++++++++");
	console.log("req.user : " +req.user);
	next();
});

//Global vars
app.use(function(req, res, next) {
	res.locals.success_msg =req.flash('success_msg');
	res.locals.error_msg =req.flash('error_msg');
	res.locals.error =req.flash('error');
	res.locals.user =req.user || null;
	next();
});

app.use('/', routes);
app.use('/users', users);

// set port

app.set('port', (process.env.PORT || 8081));
app.listen(app.get('port'), function() {
	console.log("Application is running at " +app.get('port'));						  
});

//module.exports = app;