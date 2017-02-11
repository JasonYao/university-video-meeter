var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    URLSlugs = require('mongoose-url-slugs');
require('mongoose-type-email');

var secrets = require('./secrets');

// First we deal with a normal user of the site
var User = new Schema({
    // username, password provided by passport plugin, so no need to put it here
    firstName: {type: String},
    lastName: {type: String},
    email: {type: mongoose.SchemaTypes.Email},




    interests: [{type: Schema.Types.ObjectId, ref:'Interest'}],
    posts: [{type: Schema.Types.ObjectId, ref:'Post'}]
});
User.plugin(passportLocalMongoose);






Use password plugin
AmbassadorID (DocumentID to an Ambassador object)
Profile Picture (String, link to either a 3rd party hosting site, Amazon services, or a CDN. For MVP might be able to get away with just sticking it into the DB)
Bio (String)
Location (String)
Preferred Language (String)

Ambassador
University (String, theoretically this should be an objectID to a location object, but we’ll just hack it together)
University Location (String)
Languages Spoken (List of Strings)
Current Year in University (Number)
Clubs they are a part of (String, should be a list of objectIDs to a Club object, but hack)
Stripe username or whatever is required to give their card






// A Post
var Post = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'},
    userName: {type: String},
    title: {type: String, required: true},
    interest: {type: Schema.Types.ObjectId, ref:'Interest'},
    interestName: {type: String},
    interestSlug: {type: String},
    createdAt: {type: Date, required: true},
    modifiedAt: {type: Date, required: true},
    text: {type: String},
    image: {type: String},
    children: [{type: Schema.Types.ObjectId, ref:'Post'}]
});

// An Interest
var Interest = new Schema({
    name: {type: String, required: true, unique: true, dropDups: true},
    description: {type: String, required: true},
    moderators: [{type: Schema.Types.ObjectId, ref:'User'}],
    users: [{type: Schema.Types.ObjectId, ref:'User'}],
    posts: [{type: Schema.Types.ObjectId, ref:'Post'}]
});

Post.plugin(URLSlugs('title'));
Interest.plugin(URLSlugs('name'));
//TODO see if we need url slugs for a user

// "register" it so that mongoose knows about it.
// Place after schema and before db connection
mongoose.model('User', User);
mongoose.model('Post', Post);
mongoose.model('Interest', Interest);

// db connection after all schemas are registered
mongoose.connect(secrets.dbConnectionString);
