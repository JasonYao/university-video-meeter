"use strict";
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    URLSlugs = require('mongoose-url-slugs');
require('mongoose-type-email');

var secrets = require('./secrets');

// First we deal with a normal user of the site
var User = new Schema({
    // username, password provided by passport plugin, so no need to put it here
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: mongoose.SchemaTypes.Email, required: true, unique: true, dropDups: true},
    ambassadorID: {type: Schema.Types.ObjectId, ref:'Ambassador'},
    bio: {type: String},
    location: {type: String},
    languagePreference: {type: String}
});
User.plugin(passportLocalMongoose);

// Now we setup ambassadors, which is a subset of the active users

var Ambassador = new Schema({
    university: {type: String, required: true}, /* Note: Technically this could be an objectID to a university, but it's alright for now*/
    universityLocation: {type: String, required: true},
    currentYear: {type: Number, required: true},
    languagesSpoken: [{type: String, required: true}],
    clubs: [{type: String}]
});

// URL slugs
User.plugin(URLSlugs('username'));

// "register" it so that mongoose knows about it.
// Place after schema and before db connection
mongoose.model('User', User);
mongoose.model('Ambassador', Ambassador);

// db connection after all schemas are registered
mongoose.connect(secrets.dbConnectionString);
