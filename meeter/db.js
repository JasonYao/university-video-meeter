"use strict";
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    URLSlugs = require('mongoose-url-slugs');
require('mongoose-type-email');

const secrets = require('./secrets');

// First we deal with a normal user of the site
var User = new Schema({
    // username, password provided by passport plugin, so no need to put it here
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: mongoose.SchemaTypes.Email, required: true, unique: true, dropDups: true},
    ambassadorID: {type: Schema.Types.ObjectId, ref:'Ambassador'},
    bio: {type: String},
    location: {type: String},
    languagePreference: {type: String},
    isAmbassador: {type: Boolean}, /* NOTE: We can't just depend on undefined ambassadorID */
    photo: {type: String}, /* We store the images in S3, and just save the link to the image here */
    connections: [{type: Schema.Types.ObjectId, ref:'User'}] /* A list of users the user has given permission to talk to */
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

// Sets mongoose to use ES6 native promises
mongoose.Promise = global.Promise;

// db connection after all schemas are registered
mongoose.connect(secrets.dbConnectionString);
