//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// code referenced from : https://github.com/IGM-RichMedia-at-RIT/LoginApp/blob/master/src/router.js

// keep track of what pages require login and logout using middleware. 
var controllers = require('./controllers');
var mid = require('./middleware');

var router = function(app){

	app.get("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage); 
    app.post("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.login); 
    app.get("/signup", mid.requiresSecure,mid.requiresLogout, controllers.Account.signupPage);
    app.post("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.get("/logout", mid.requiresLogin, controllers.Account.logout);
    app.get("/application",mid.requiresLogin, controllers.Application.appPage);
    app.get("/", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;