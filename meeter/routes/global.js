"use strict";
var express = require('express');
var router = express.Router();
var helper = require('../helper');

/*
* Home Page
*/
router.get('/', function(req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Home";

    res.render('index', context);
});

module.exports = router;
