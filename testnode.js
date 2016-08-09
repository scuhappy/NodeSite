http =  require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var urlencodeParser = bodyParser.urlencoded({extended: true});

var mongoose = require('mongoose');
var DBTesturl = 'mongodb://localhost:27017/Test';
var dbTest = mongoose.createConnection(DBTesturl);

dbTest.on('error',console.error.bind(console,'connect error: '));
dbTest.once('open',function(){
    console.log("open success!");
});
var PersonSchema = new mongoose.Schema({name:String,
                                       password:String});
var PersonModel = dbTest.model('User',PersonSchema);
PersonModel.find({'name':'ychen'},function(err,docs){
        console.log(docs);
})

app.use(cookieParser());
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended:false}));


var CurrentVote={"VoteNumber":"","Person":[],"VoteCreateDate":""};
var Votes={"Votes":[],"VotesNumber":"0"};
var flag =0;

var UserList = {
    'Users':[
    {'UserName':'ychen','Password':'12345'},
    {'UserName':'yfu','Password':'12345'},
    {'UserName':'edai','Password':'12345'},
    ]
}
var UserNames = [];
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
};
var CheckUser =function(name,password){
    var _res=1;
    console.log("res = "+res);
    return res;
};
function CheckVoted(UserName){
    for(var i=0;i<CurrentVote.VoteStatus.length;i++)
	{
        console.log("***************"+ CurrentVote.VoteStatus[i].PersonName);
        if( CurrentVote.VoteStatus[i].PersonName == UserName)
		{
            console.log("************"+ CurrentVote.VoteStatus[i].HasVoted);
            return   CurrentVote.VoteStatus[i].HasVoted;
		}
	}
}


app.get('/',function(request,response){
	
});
app.get('/GetUserList',function(resquest,response){
    for(var i=0;i<UserList.Users.length;i++)
    {
        UserNames[i]=UserList.Users[i].UserName;
    }
    console.log(UserNames);
    response.write(UserNames.join(" "));
    response.end();
})
app.get('/GetAllVoteContent',function(request,response){
    console.log("Get all vote received!");
    response.write(JSON.stringify(Votes));
    response.end();
})
app.get('/GetVoteContent',function(request,response){
	//get the latest vote;
	var _vote = Votes.Votes[Votes.Votes.length-1];
	
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
    console.log("Cookies : ",request.cookies.UserName);
    if(request.cookies.UserName !="" && request.cookies.UserName!= undefined)
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
    CurrentVote = JSON.parse(request.body.data);
	CurrentVote.VoteNumber = Votes.Votes.length;
	var date = new Date();
	console.log("Current time "+date);
	CurrentVote.VoteCreateDate = date;
	
	//Add current vote to votes
	Votes.Votes[Votes.Votes.length]=CurrentVote;
	
	Votes.VotesNumber = Votes.Votes.length;
	console.log("********"+ Votes.Votes[0].VoteNumber);
    response.end();
})
app.post('/SendScore',urlencodeParser,function(request,response){
    var obj = JSON.parse(request.body.data);	
    for(var i=0;i<CurrentVote.Person.length;i++)
    {
        CurrentVote.Person[i].PersonScore = parseInt(CurrentVote.Person[i].PersonScore) + parseInt(obj.Person[i].PersonScore);
    }
    for(var j = 0;j<CurrentVote.VoteStatus.length;j++)
    {
        if(CurrentVote.VoteStatus[j].PersonName == request.cookies.UserName)
        {
            CurrentVote.VoteStatus[j].HasVoted = 1;
        }
    }
	//Copy the currentvote to votes. Use reference will be better.
	Votes.Votes[Votes.Votes.length-1]=CurrentVote;
    response.end();
})
app.post('/Login',urlencodeParser,function(request,response){
    console.log(JSON.stringify(request.body));
    var obj = request.body;
    if(CheckUser(obj.UserName,obj.Password))
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
app.post('/SignUp',urlencodeParser,function(request,response){
	console.log("*************Sign Up Received! " +  request.body.data);
	var obj = JSON.parse(request.body.data);
	for(var i=0;i<UserList.Users.length;i++)
	{
		if(obj.UserName == UserList.Users[i].UserName)
		{
			response.end("Error");
		}
	}
	UserList.Users[UserList.Users.length]= obj;
    var VoteStatus={'PersonName':obj.UserName,'HasVoted':'NVoted','VoteScore':0};
    CurrentVote.VoteStatus[CurrentVote.VoteStatus.length]=VoteStatus;
	response.end("Success");
});
var server = app.listen(80,"127.0.0.1", function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("listen on  http://%s:%s", host, port);

})
