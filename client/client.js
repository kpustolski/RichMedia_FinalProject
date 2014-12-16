
//Katie pustolski
//12/17/14
//Rich Meia web app II Final Project
// code referenced from : https://github.com/IGM-RichMedia-at-RIT/LoginApp/blob/master/client/client.js
"use strict";

$(document).ready(function() {
	//handle error messages
	//  if there is one, print it to the screen via a paragraph element
	function handleError(message){
		// console.log("in handle message");
		document.getElementById("message").innerHTML=message;
	}
	
	//AJAX to handle errors
	function sendAjax(action,data){
		$.ajax({
			cache:false,
			type:"POST",
			url:action,
			data:data,
			dataType: "json",
			success: function(result,status,xhr){
				// console.log("In ajax. SUCCESS");
				window.location = result.redirect;
			},
			
			error:function(xhr,status,error){
				var messageObj = JSON.parse(xhr.responseText);
				
				handleError(messageObj.error);
			}
		});
	}
	
	//when user hits submit, check for errors
	$("#signupSubmit").on("click", function(e){
		e.preventDefault();
		
		 if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
			handleError("All fields are required");
			return false;
		}
		
		if($('#pass').val()!= $('#pass2').val()){
			handleError("Passwords do not match");
			return false;
		}
		
		sendAjax($('#signupForm').attr("action"), $("#signupForm").serialize());
	
		return false;
	});
	//when the user hits login, check for errors
	$("#loginSubmit").on("click", function(e){
		e.preventDefault();
		
		if($("#user").val()== '' || $("#pass").val()==''){
			handleError("Username or password is empty");
			return false;
		}
		sendAjax($('#loginForm').attr("action"), $("#loginForm").serialize());
		
		return false;
	});

});
