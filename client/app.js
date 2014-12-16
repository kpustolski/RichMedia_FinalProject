
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// http://colpick.com/plugin

"use strict";
// if app exists use the existing copy
// else create a new object literal

var app = app || {};


//Color Picker code-------------------
var colorPicked;

$('.color-box').colpick({
	colorScheme:'dark',
	layout:'rgbhex',
	color:'ff8800',
	onSubmit:function(hsb,hex,rgb,el) {
		$(el).css('background-color', '#'+hex);
		$(el).colpickHide();

		colorPicked = "#"+hex + "";

	}

});
$('.color-box').css('background-color','#ff8800');
//------------------------
//Jquery slider code------------------
$( "#lineWidthSlider" ).slider({
      value:20,
      min: 1,
      max: 200,
      step: 1,
      slide: function( event, ui ) {
        $( "#lineWidthNum" ).val( ui.value + "px");
      }
    });
    $( "#lineWidthNum" ).val($( "#lineWidthSlider" ).slider( "value" ) + "px" );
// ---------------------------------

// connect to socket
// var socket = io.connect('http://localhost');
var socket = io.connect();
// create app 
app.doodleBucket = {

	//Variables

	DEFAULT_LINE_WIDTH : 20,
	DEFAULT_STROKE_STYLE: '#ff8800',

	canvas:undefined,
	ctx:undefined,

	eraserBtn:undefined,
	penBtn:undefined,
	lineWidthSlider:undefined,
	clearCanvasBtn:undefined,
	lineWithPara:undefined,
	exportCanvasBtn:undefined,
	sendBtn:undefined,
	chatBox:undefined,
	message:undefined,


	WIDTH:undefined,
	HEIGHT:undefined,
	showGrid:undefined,
	gridChecked : false,
	dragging: undefined,
	lineWidth:undefined,
	strokeStyle:undefined,
	mouseCursorPos:undefined,
	cursor:undefined,
	mouse:{},

	earserOn: false,
	penOn:true,
	//t for time
	t:undefined,

	user:undefined,
	draws:{},

	init:function(){

		// set up canvas
		this.canvas = document.querySelector('#mainCanvas');
		this.ctx = this.canvas.getContext('2d');

		// get ids on tools and chat
		this.eraserBtn = document.querySelector('#eraserBtn');
		this.penBtn = document.querySelector('#penBtn');
		this.lineWidthSlider = document.querySelector('#lineWidthSlider');
		this.clearCanvasBtn = document.querySelector('#clearCanvasBtn');
		this.exportCanvasBtn = document.querySelector('#exportCanvasBtn');
		this.lineWidthPara = document.querySelector('#lineWidthNum');
		this.message = document.querySelector('#messageChat');
		this.sendBtn = document.querySelector('#sendBtn');
		this.chatBox = document.querySelector('#chatBox');

		//set canvas width and height
		this.WIDTH = window.innerWidth-375;
		this.HEIGHT=window.innerHeight;
		this.canvas.height = this.HEIGHT;
		this.canvas.width = this.WIDTH;

		// set default values
		this.dragging = false;
		this.ctx.lineWidth = this.DEFAULT_LINE_WIDTH;
		this.ctx.strokeStyle = this.DEFAULT_STROKE_STYLE;
		colorPicked = this.DEFAULT_STROKE_STYLE;
		this.ctx.lineCap ="round";
		this.ctx.lineJoin = "round";
		this.user = 'user'+ (Math.floor((Math.random()*1000))+1);
		this.chatBox.placeholder="You are: "+ this.user;
		this.penBtn.style.opacity= "1.0";

		// add eventlisteners 
		this.eraserBtn.addEventListener("click", function(){
			this.eraserOn=true; this.penOn=false; this.style.opacity="1.0"; app.doodleBucket.penBtn.style.opacity="0.5";
		});

		this.penBtn.addEventListener("click", function(){
			this.penOn=true; this.eraserOn=false; this.style.opacity="1.0"; app.doodleBucket.eraserBtn.style.opacity="0.5";
		});

		//if the clear button is clicked, clear canvas
		this.clearCanvasBtn.addEventListener("click", function(){
			var clearedIsClicked;
			//make sure the user wants to do this
			var check = confirm("Are you sure you want to clear the canvas for you and the other clients?");
			if(check){
				clearedIsClicked=true;
				socket.emit('clear', clearedIsClicked);
			}
			//don't do anything
			else{

			}

		});
		// if the send button is hit for the chat box, send the message to the server
		this.sendBtn.addEventListener("click", function(){
			//get message
			var m = app.doodleBucket.message.value;
			var data = {
				message:m,
				user: app.doodleBucket.user
			};
			//send data
			socket.emit('textmessage', data);
			// clear the message box
			app.doodleBucket.message.value="";

		});
		//when the export canvas button is clicked, copy the canvas and open another window
		// for the user to save image
		this.exportCanvasBtn.onclick = this.doExport;

		// check to see if these buttons are clicked
		this.eraserBtn.onclick = function(){
			app.doodleBucket.eraserOn=true; 
			app.doodleBucket.penOn=false;
		}
		this.penBtn.onclick = function(){
			app.doodleBucket.eraserOn=false; 
			app.doodleBucket.penOn=true;
		}

		// mouse events
		this.canvas.onmousedown = this.mouseDown;
		this.canvas.onmousemove = this.mouseMove;
		this.canvas.onmouseup = this.mouseUp;
		this.canvas.onmouseout = this.mouseOut;

		//set up for recieveing information from server
		this.setup(this.user);
	},

	// set up data to send to the server via socket.io
	setup:function(usernum){
		// new vars
		var time = new Date().getTime();
		var x = this.mouse.x;
		var y = this.mouse.y;
		//store the scope in a variable
        var setUpFuncScope = this;
		// fill data object according to the user. 
		// This should keep track of any changes the user makes on the canvas and when
		// it also keeps track of the users mouse positions
		this.draws[usernum] = {lastUpdate:time,x:x,y:y};

		// recieve data from the server. This should grab the data from the other clients
		// and draw what they draw on the canvas. 
		socket.on('draw',function(data){
            
			//make empty object
		 	setUpFuncScope.draws[usernum]={};

			if(!setUpFuncScope.draws[data.name]){
           	 	
           	 	setUpFuncScope.draws[data.name]=data;

			}
			else if(data.lastUpdate>setUpFuncScope.draws[data.name].lastUpdate){
				setUpFuncScope.draws[data.name].x=data.x;
                setUpFuncScope.draws[data.name].y=data.y;
			}
			// if the other user is dragging on the canvas,
			//draw what they are drawing

			// if the other clients are beginning to draw, begin creating a line on the canvas based
			//on their x and y coords
            if(data.isBeginning){
                setUpFuncScope.ctx.beginPath();
                setUpFuncScope.ctx.moveTo(data.x,data.y);	
            }
            // if the client is dragging on the canvas, make sure their tool settings are correct.
			if(data.isDragging==true){

				setUpFuncScope.ctx.save();
				setUpFuncScope.ctx.strokeStyle= data.strokeColor;
				setUpFuncScope.ctx.lineWidth= data.lineWidth;
                setUpFuncScope.ctx.lineTo(data.x+0.1,data.y+0.1);
                setUpFuncScope.ctx.stroke();
				setUpFuncScope.ctx.restore();
			}
			// if the other clients stop drawing, close their path.
			else{
				setUpFuncScope.ctx.closePath();
			}


		});
		// recieve message data from the server for the chat box
		socket.on('textmessage',function(data){
			// add the message from the server to the chat box
			app.doodleBucket.chatBox.innerHTML+= data.user + ": " + data.message +"\n";

		});
		// if the data recieved from the server is true, clear the canvas
		socket.on('clear',function(data){
			if(data){
				// add the message from the server to the chat box
				app.doodleBucket.ctx.clearRect( 0 ,0,app.doodleBucket.WIDTH,app.doodleBucket.HEIGHT);
			}

		});
	},
	// from rich media web app 1 HW
	// for exporting the canvas and so the user can copy and paint it
	doExport:function(){
		var data = app.doodleBucket.canvas.toDataURL(); 
		var windowName = "canvasImage";
		var windowOptions = "left=0,top=0,width=" + app.doodleBucket.canvas.width + ",height=" + app.doodleBucket.canvas.height +",toolbar=0,resizable=0";
		var myWindow = window.open(data,windowName,windowOptions);
		myWindow.resizeTo(app.doodleBucket.canvas.width,app.doodleBucket.canvas.height); // needed so Chrome would display image
	 },

	 //when mouse is down
	mouseDown:function(e){
		app.doodleBucket.dragging= true;
		//location of mouse in canvas
		var mouse = app.doodleBucket.getMouse(e);

		//Pencil tool
		app.doodleBucket.ctx.beginPath();
		app.doodleBucket.ctx.moveTo(app.doodleBucket.mouse.x,app.doodleBucket.mouse.y);
		/***********************
			the following code is repetative in the next couple methods. I haven't figured out how to get it working otherwise. 
		***********************/
		//get the time
	 	app.doodleBucket.t = new Date().getTime();
   
		//set values of  draws object so that it can be sent to the server
		//username
		app.doodleBucket.draws[app.doodleBucket.user].name = app.doodleBucket.user;
		//time of drawing
		app.doodleBucket.draws[app.doodleBucket.user].lastUpdate = app.doodleBucket.t;
		//mouse x coords
		app.doodleBucket.draws[app.doodleBucket.user].x = app.doodleBucket.mouse.x;
		//mouse y coords
		app.doodleBucket.draws[app.doodleBucket.user].y = app.doodleBucket.mouse.y;
		//color of stroke
		app.doodleBucket.draws[app.doodleBucket.user].strokeColor = app.doodleBucket.ctx.strokeStyle;
		//linewidth of pen tool
		app.doodleBucket.draws[app.doodleBucket.user].lineWidth = app.doodleBucket.ctx.lineWidth;
        // should the line begin?
        app.doodleBucket.draws[app.doodleBucket.user].isBeginning = true;

		//is the user drawing on the canvas?
		app.doodleBucket.draws[app.doodleBucket.user].isDragging = app.doodleBucket.dragging;
		// sent the draws object out to the server
		socket.emit('draw', app.doodleBucket.draws[app.doodleBucket.user]);
	},
	//when mouse moves
	mouseMove:function(e){
		//find mouse coords.
		var mouse = app.doodleBucket.getMouse(e);
		//bail out if mouse button is not down
		 if(app.doodleBucket.dragging){

		 	// check to see what tool is on
		 	//if pen is one, set the stroke color to wht ever the color picker says
		 	if(app.doodleBucket.penOn && !app.doodleBucket.eraserOn){

		 		app.doodleBucket.ctx.strokeStyle=colorPicked;

		 	}
		 	// else if the eraser is one, change the stroke style to white
		 	else if (app.doodleBucket.eraserOn && !app.doodleBucket.penOn){
		 		app.doodleBucket.ctx.strokeStyle = "white";

		 	}
		 	else{
		 		app.doodleBucket.ctx.strokeStyle=colorPicked;
		 	}
		 	//set line width to what the user sets with the slider
		 	app.doodleBucket.ctx.lineWidth = $("#lineWidthSlider").slider("value");
		 	//draw what the user draws on canvas
		 	app.doodleBucket.ctx.lineTo(app.doodleBucket.mouse.x,app.doodleBucket.mouse.y);
		 	app.doodleBucket.ctx.stroke();

		 	//get the time
		 	app.doodleBucket.t = new Date().getTime();
	   
			//set values of  draws object so that it can be sent to the server
			//username
			app.doodleBucket.draws[app.doodleBucket.user].name = app.doodleBucket.user;
			//time of drawing
			app.doodleBucket.draws[app.doodleBucket.user].lastUpdate = app.doodleBucket.t;
			//mouse x coords
			app.doodleBucket.draws[app.doodleBucket.user].x = app.doodleBucket.mouse.x;
			//mouse y coords
			app.doodleBucket.draws[app.doodleBucket.user].y = app.doodleBucket.mouse.y;
			//color of stroke
			app.doodleBucket.draws[app.doodleBucket.user].strokeColor = app.doodleBucket.ctx.strokeStyle;
			//linewidth of pen tool
			app.doodleBucket.draws[app.doodleBucket.user].lineWidth = app.doodleBucket.ctx.lineWidth;
              // should the line begin?
            app.doodleBucket.draws[app.doodleBucket.user].isBeginning = false;

			//is the user drawing on the canvas?
			app.doodleBucket.draws[app.doodleBucket.user].isDragging = app.doodleBucket.dragging;
			// sent the draws object out to the server
			socket.emit('draw', app.doodleBucket.draws[app.doodleBucket.user]);
		 }
		 else{
		 	return;
		 }

	},
	//mouse if off canvas
	mouseOut:function(e){
		app.doodleBucket.dragging = false;
		app.doodleBucket.ctx.closePath();

	},
	//mouse is off canvas
	mouseUp:function(e){
		app.doodleBucket.dragging = false;
		app.doodleBucket.ctx.closePath();

        app.doodleBucket.t = new Date().getTime();

		//set values of  draws object so that it can be sent to the server
		//username
		app.doodleBucket.draws[app.doodleBucket.user].name = app.doodleBucket.user;
		//time of drawing
		app.doodleBucket.draws[app.doodleBucket.user].lastUpdate = app.doodleBucket.t;
		//mouse x coords
		app.doodleBucket.draws[app.doodleBucket.user].x = app.doodleBucket.mouse.x+0.1;
		//mouse y coords
		app.doodleBucket.draws[app.doodleBucket.user].y = app.doodleBucket.mouse.y+0.1;
		//color of stroke
		app.doodleBucket.draws[app.doodleBucket.user].strokeColor = app.doodleBucket.ctx.strokeStyle;
		//linewidth of pen tool
		app.doodleBucket.draws[app.doodleBucket.user].lineWidth = app.doodleBucket.ctx.lineWidth;
        
        //is the user drawing on the canvas?
		app.doodleBucket.draws[app.doodleBucket.user].isDragging = app.doodleBucket.dragging;
		  // should the line begin?
        app.doodleBucket.draws[app.doodleBucket.user].isBeginning = false;
        //send data to server
        socket.emit('draw', app.doodleBucket.draws[app.doodleBucket.user]);

	},
	// get the mouse coordinates
	getMouse:function(e){
		app.doodleBucket.mouse.x = e.pageX - e.target.offsetLeft;
		app.doodleBucket.mouse.y = e.pageY - e.target.offsetTop;
		return app.doodleBucket.mouse;
	}

	/*****************
		helper method attempting to get rid of repeated code
		caused more problems
	*****************/
	// emitDraw:function(lineBegins){

 //    		 	//get the time
	//  	app.doodleBucket.t = new Date().getTime();

 //        // console.log("app.doodleBucket.user: "+ app.doodleBucket.user);
   
	// 	//set values of  draws object so that it can be sent to the server
	// 	//username
	// 	app.doodleBucket.draws[app.doodleBucket.user].name = app.doodleBucket.user;
	// 	//time of drawing
	// 	app.doodleBucket.draws[app.doodleBucket.user].lastUpdate = app.doodleBucket.t;
	// 	//mouse x coords
	// 	app.doodleBucket.draws[app.doodleBucket.user].x = app.doodleBucket.mouse.x;
	// 	//mouse y coords
	// 	app.doodleBucket.draws[app.doodleBucket.user].y = app.doodleBucket.mouse.y;
	// 	//color of stroke
	// 	app.doodleBucket.draws[app.doodleBucket.user].strokeColor = app.doodleBucket.ctx.strokeStyle;
	// 	//linewidth of pen tool
	// 	app.doodleBucket.draws[app.doodleBucket.user].lineWidth = app.doodleBucket.ctx.lineWidth;

	// 	// console.log("this.dragging: "+ app.doodleBucket.dragging);
	// 	//is the user drawing on the canvas?
	// 	app.doodleBucket.draws[app.doodleBucket.user].isDragging = app.doodleBucket.dragging;
 //        app.doodleBucket.draws[app.doodleBucket.user].isBeginning = lineBegins;
	// 	// sent the draws object out to the server
 //        // console.log(app.doodleBucket.draws[app.doodleBucket.user]);
	// 	socket.emit('draw', app.doodleBucket.draws[app.doodleBucket.user]);
	// }
};
// when the window loads, call the init function
window.onload=app.doodleBucket.init();

