
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// code referenced from : https://github.com/IGM-RichMedia-at-RIT/LoginApp/blob/master/src/controllers/Account.js

// load in models
var models = require('../models');
var Account = models.Account;

// render pages
var loginPage = function(req,res){
	res.render('login');
};

var signupPage= function(req,res){
	res.render('signup');
};

var logout = function(req,res){
	req.session.destroy();

	res.redirect('/');
};

// detect errors when loging in
var login = function(req,res){

	var username = req.body.username;
	var password = req.body.password;
	
	// console.log("un"+ username);
	// console.log("pass"+password);
	if(!username || !password){
		return res.status(400).json({error: "All fields are required"});
		

	}

	Account.AccountModel.authenticate(username,password,function(err,account){
		if(err || !account){
			return res.status(401).json({error: "Wrong username or password"});

		}

		req.session.account  = account.toAPI();

		//redirect to application if everything is fine
		res.json({redirect:'/application'});

	});
};

// check for errors on the sign up page
var signup= function(req,res){

	if(!req.body.username || !req.body.password || !req.body.password2){
		return res.status(400).json({error:"All fields are required"});
	}

	if(req.body.password !== req.body.password2){

		return res.status(400).json({error: "Passwords do not match"});
	}
	// create an account
	Account.AccountModel.generateHash(req.body.password, function(salt,hash){

		var accountData = {
			username:req.body.username,
			salt:salt,
			password:hash
		};

		var newAccount = new Account.AccountModel(accountData);

		newAccount.save(function(err){
			if(err){
				console.log(err);
				return res.status(400).json({error:"an error occured"});
			}
			req.session.account = newAccount.toAPI();
			//redirect to application f everything  is fine
			res.json({redirect:'/application'});
		});
	});

};

// export 
module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;