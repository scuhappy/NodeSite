http =  require('http');
var fs = require('fs');
var url = require('url');
var nodemailer  = require("nodemailer");
var express = require('express');
var app = express();

var user = '244241928@qq.com'
  , pass = 'Google2015'
  ;

var vote;
var flag =0;
var VoteTime=0;

function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    };
var CheckUser =function(){
	return 1;
}
var UserInfo={"UserName":"","Password":""};

app.use(express.static(__dirname + '/'));

app.get('/.*',function(request,response){
	
	console.log("clinet ip : "+getClientIp(request));
	
	// Get client Cookie
    var Cookies = {};
    request.headers.cookie && request.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    console.log(Cookies);
	
	//GET Method
	var pathname = request.path;
	console.log("Request for " + pathname + " received.");
	if(pathname=="/GetVoteContent"){//send data
		console.log("***********Write vote content");
		response.write(JSON.stringify(vote));
		response.end();
	}
	else if(pathname == "/GetUserInfo")
	{
		console.log("*******Write user info"+UserInfo.UserName);
		response.write(UserInfo.UserName);
		response.end();
	}
	else
	 {
		if(pathname=="/")
		{
			pathname = "/index.html";
		}
		fs.readFile(pathname.substr(1),function(err,data){
			if(err){
				console.log(err);
				response.writeHead(404,{'content-Type':'text/html'});
			}else{
				response.writeHead(200,{'Content-Type':'text/html'});
				response.write(data.toString());
			}
			response.end();
		});
	 }
	
});


app.post('PostVote',function(request,response){
		var obj = JSON.parse(request.body);
		vote = obj;
		console.log(vote.VotePersonNumber);
		response.end();
})
app.post('SendScore',function(request,response){
	var obj = JSON.parse(request.body);
	for(var i=0;i<vote.Person.length;i++)
		{
			vote.Person[i].PersonScore = parseInt(vote.Person[i].PersonScore) + parseInt(obj.Person[i].PersonScore);
			console.log(vote.Person[i].PersonScore);
		}
	VoteTime++;
	response.end();
})
app.post('Login',function(request,response){
	var obj = JSON.parse(request.body);
	if(CheckUser()>0)
		{
			console.log("&&&&&&&&&&&&&&&&&&&User name "+obj.UserName);
			UserInfo = obj;
			// Set a cookie to client
			response.writeHead(200, {
			'Set-Cookie': ["aaa=eval(obj.UserName)","ccc=ddd","eee=fff"],
			'Content-Type': 'text/plain'
			});
			response.end();
		}
})
var server = app.listen(80,"127.0.0.1", function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("listen on  http://%s:%s", host, port);

})
