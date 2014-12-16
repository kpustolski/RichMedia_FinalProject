
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
var _ = require('underscore');
var models = require('../models');

var appPage = function(req,res){

	res.render('app');
};

module.exports.appPage = appPage;