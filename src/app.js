
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// code referenced from : https://github.com/IGM-RichMedia-at-RIT/LoginApp/blob/master/src/app.js

//import libraries 
var path = require('path'); 
var express = require('express');  
var compression = require('compression');  
var favicon = require('serve-favicon'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
var mongoose = require('mongoose'); 
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var url = require('url');
var fs = require('fs');

// connect mongoose
var dbURL = process.env.MONGOHQ_URL || "mongodb://localhost/MVCproject";


var db = mongoose.connect(dbURL,function(err){

	if(err){
		console.log('Could not connect to database');
		throw err;
	}
});

// connect redis
var redisURL = {
    hostname: 'localhost',
	port: 6379
 };

var redisPASS;

if(process.env.REDISCLOUD_URL){
     redisURL = url.parse(process.env.REDISCLOUD_URL);
     redisPASS = redisURL.auth.split(":")[1];
 }

// pull in routes
var router = require('./router.js');

var server;
// find a usable port
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// use express
var app = express(); 

app.use('/assets',express.static(path.resolve(__dirname+ '../../client')));
app.use(compression());
app.use(bodyParser.urlencoded({ 
  extended: true                
}));    

 app.use(session({
    store: new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPASS 
   }),
     secret: 'Domo',
     resave: true,
     saveUninitialized: true
 }));

app.set('view engine', 'jade'); 
app.set('views', __dirname + '/views');
app.use(favicon(__dirname + '/../client/img/favicon.png'));
app.use(cookieParser());

router(app);

server = app.listen(port,function(err){
	if(err){
		throw err;
	}

	console.log('listening on port'+ port);

});

/*************
SOCKET.IO
*************/

var io = require('socket.io')(server);
// connect server
io.on('connection', function(soc){
    // create a room to send the users
    soc.join('room1');
    // send back data to the client
    //canvas
    soc.on('draw', function(data){
        io.sockets.in('room1').emit('draw', data);

    });
    //char box
    soc.on('textmessage', function(data){
        io.sockets.in('room1').emit('textmessage', data);

    });
    //clear canvas
    soc.on('clear', function(data){
        io.sockets.in('room1').emit('clear', data);

    });
});