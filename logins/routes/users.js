var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('../config/auth');


//register
router.get('/register', function (req, res) {
	console.log("get register ");
    res.render('register');
});

//login
router.get('/login', function (req, res) {
    res.render('login');
});

//register users
router.post('/register', function (req, res) {
	console.log("post register");
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	
	req.checkBody('name', "Name is requierd").notEmpty();
	req.checkBody('username', "Username is requierd").notEmpty();
	req.checkBody('email', "Email is requierd").notEmpty();
	req.checkBody('email', "Email is not valid").isEmail();
	req.checkBody('password', "Password is requierd").notEmpty();
	req.checkBody('password2', "Password do not match").equals(req.body.password);
	
	var errors = req.validationErrors();
	if(errors) {
		res.render('register', {errors: errors});	
	} else {
		newUser = new User({
			name: name,
			username: username,
			email:email,
			password: password
		});
		
		User.createUser(newUser, function(err, user) {
			if(err) throw err;
			console.log(user);
		});
		
		req.flash('success_msg', 'You are register and can you login');
		
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
		if(err) throw err;
		if(!user) {
			return done(null, false, {message: 'Unknown user'});	
		}
		User.comparePassword(password, user.password, function(err, isMatch) {
			if(err) throw err;
			if(isMatch) {
				return done(null, user);
			} else {
				return done(null, false, {message: 'Incorrect Password'});	
			}
		});
	});
  }
));

//serealize and deserealize function
passport.serializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res) {
	req.logout();
	
	req.flash('success_msg', 'You are logout');
	
	res.redirect('/users/login');
});

//facebook strategy
passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientId,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) { console.log("profile.id : " +profile.id);
    process.nextTick(function() {
		User.getUserFacebookById(profile.id, function(err, user) {
			if(err)
				return done(err);
			if(user)
				return done(null, user);
			else {
				var newUser = new User();
				newUser.facebook.id = profile.id;
				newUser.facebook.name = profile.name.givenName + " " +profile.name.familyName ;
				newUser.facebook.email = profile.email;
				newUser.facebook.token = accessToken;
				newUser.save(function(err) {
					if(err)
						return err;
					else
						return done(null, newUser);
				});
			}
		});						  
	});
  }
));

//    /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/users/login' }));

module.exports = router;
// JavaScript Document