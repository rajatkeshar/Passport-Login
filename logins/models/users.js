var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema  = new Schema({
	username: { 
		type: String,
		index: true
		},
	name: {
		type: String
		},	
	email: {
		type: String
		},
	password: {
		type: String
		},
	password2:{
		type: String
		},
		
	facebook: {
		id: {
			type: String
		},
		token: {
			type: String
		},
		email: {
			type: String
		},
		name: { 
			type: String
		}
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}
module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserFacebookById = function(id, callback) {
	var query = {"facebook.id": id};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
	console.log("id: " +JSON.stringify(id));
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
			//if(err){ throw err };									
			callback(null, isMatch);
	});
}

// JavaScript Document