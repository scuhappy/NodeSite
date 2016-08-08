http =  require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var urlencodeParser = bodyParser.urlencoded({extended: true});


app.use(cookieParser());
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended:false}));

var vote={"VoteNumber":"","Person":[],"VoteCreateDate":""};
var Votes={"Votes":[],"VotesNumber":"0"};
var flag =0;

var UserList = {
    'Users':[
    {'UserName':'ychen','Password':'12345','hasVoted':0},
    {'UserName':'yfu','Password':'12345','hasVoted':0},
    {'UserName':'edai','Password':'12345','hasVoted':0},
    ]
}
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
};
var CheckUser =function(name,password){
    for(var i=0;i<UserList.Users.length;i++)
    {
        console.log(name + " "+password);
        console.log(UserList.Users[i].UserName +" "+ UserList.Users[i].Password );
        if(UserList.Users[i].UserName == name && UserList.Users[i].Password == password)
        {
            return 1;
        }
    }
    return 0;
}
function CheckVoted(UserName){
	for(var i=0;i<UserList.Users.length;i++)
	{
		console.log("***************"+ UserList.Users[i].UserName);
		if( UserList.Users[i].UserName == UserName)
		{
			console.log("************"+ UserList.Users[i].hasVoted);
			return  UserList.Users[i].hasVoted;
		}
		
	}
}


app.get('/',function(request,response){
	
});
app.get('/GetVoteContent',function(request,response){
	var _vote = Votes.Votes[Votes.Votes.length-1];//get the latest vote;
	console.log(JSON.stringify(_vote));
    response.write(JSON.stringify(_vote));
    response.end();
})
app.get('/GetVoteStatus',function(request,response){
	if(parseInt(CheckVoted( request.cookies.UserName))==1)//voted
	{
		response.write("Voted");
	}
	else{
		response.write("nVoted");
	}
	response.end();
});
app.get('/GetUserInfo',function(request,response){
	var UserInfo={"UserName":"","Role":""};
    console.log("clinet ip : "+getClientIp(request));
    console.log("Cookies : ",request.cookies);
	if(request.cookies.UserName !="")
	{
		UserInfo.UserName = request.cookies.UserName;
		if(UserInfo.UserName == "edai")
		{
			UserInfo.Role ="admin";
		}else{
			UserInfo.Role="guest";
		}
	}
    response.write(JSON.stringify(UserInfo));
	console.log(JSON.stringify(UserInfo));
    response.end();
});
app.get('/LogOut',function(request,response){
	console.log("Log Out");
	response.cookie("UserName","");
	response.end();
})

app.post('/PostVote',urlencodeParser,function(request,response){
	console.log("*******Post vote   "+JSON.stringify(request.body));
    vote = JSON.parse(request.body.data);
	vote.VoteNumber = Votes.Votes.length;
	var date = new Date();
	console.log("Current time "+date);
	vote.VoteCreateDate = date;
	Votes.Votes[Votes.Votes.length]=vote;
	Votes.VotesNumber = Votes.Votes.length;
	console.log("********"+ Votes.Votes[0].VoteNumber);
    response.end();
})
app.post('/SendScore',urlencodeParser,function(request,response){
	for(var i=0;i< UserList.Users.length;i++)
	{
		if(UserList.Users[i].UserName == request.cookies.UserName)
		{
			if(UserList.Users[i].hasVoted==0)
			{
				UserList.Users[i].hasVoted =1;
			}
			else {
				response.end('Error');//HasVoted
				return;
			}
		}
	}
    var obj = JSON.parse(request.body.data);	
    for(var i=0;i<vote.Person.length;i++)
    {
        vote.Person[i].PersonScore = parseInt(vote.Person[i].PersonScore) + parseInt(obj.Person[i].PersonScore);
        console.log(vote.Person[i].PersonScore);
    }
    response.end();
})
app.post('/Login',urlencodeParser,function(request,response){
    console.log(JSON.stringify(request.body));
    var obj = request.body;
    console.log(obj.Password);
    if(CheckUser(obj.UserName,obj.Password)>0)
    {
        console.log("*******User name "+obj.UserName);
        // Set a cookie to client
        response.cookie('UserName',obj.UserName);
        response.end("Success");
    }
    else{
        response.end("Error");
    }
})
var server = app.listen(80,"127.0.0.1", function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("listen on  http://%s:%s", host, port);

})
