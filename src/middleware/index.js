
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// code referenced from : https://github.com/IGM-RichMedia-at-RIT/LoginApp/blob/master/src/middleware/index.js

// make a page require a login
var requiresLogin = function(req,res,next){

	if(!req.session.account){
		return res.redirect('/');

	}

	next();

};

// make a page require logout
var requiresLogout = function(req,res,next){

	if(req.session.account){
		return res.redirect('/application');
	}

	next();
};

//make sure page is secure
var requiresSecure = function(req,res,next){
	if(req.headers['x-forwarded-proto'] != 'https'){
		return res.redirect('https://'+ req.host + req.url);

	}
	next();
};
// can bypass secure
var bypassSecure = function(req,res,next){
	next();
};

//export
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if(process.env.NODE_ENV === "production"){
	module.exports.requiresSecure = requiresSecure;
}
else{
	module.exports.requiresSecure = bypassSecure;
}
