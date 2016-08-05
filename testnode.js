http =  require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var urlencodeParser = bodyParser.urlencoded({extended: false});


var vote;
var flag =0;
var VoteTime=0;

var UserList = {
    'Users':[
    {'UserName':'ychen','Password':'12345'},
    {'UserName':'yfu','Password':'12345'},
    {'UserName':'edai','Password':'12345'},
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
var UserInfo={"UserName":"","Password":""};

app.use(cookieParser());
app.use(express.static(__dirname + '/'));


app.get('/',function(request,response){

});
app.get('/GetVoteContent',function(request,response){
    console.log("***********Write vote content");
    response.write(JSON.stringify(vote));
    response.end();
})
app.get('/GetUserInfo',function(request,response){
    console.log("clinet ip : "+getClientIp(request));
    console.log("Cookies : ",request.cookies);

    console.log("*******Write user info"+UserInfo.UserName);
    response.write(UserInfo.UserName);
    response.end();
});


app.post('/PostVote',function(request,response){
    var obj = JSON.parse(request.body);
    vote = obj;
    console.log(vote.VotePersonNumber);
    response.end();
})
app.post('/SendScore',function(request,response){
    var obj = JSON.parse(request.body);
    for(var i=0;i<vote.Person.length;i++)
    {
        vote.Person[i].PersonScore = parseInt(vote.Person[i].PersonScore) + parseInt(obj.Person[i].PersonScore);
        console.log(vote.Person[i].PersonScore);
    }
    VoteTime++;
    response.end();
})
app.post('/Login',urlencodeParser,function(request,response){
    console.log(JSON.stringify(request.body));
    var obj = request.body;
    console.log(obj.Password);
    if(CheckUser(obj.UserName,obj.Password)>0)
    {
        console.log("*******User name "+obj.UserName);
        UserInfo = obj;
        // Set a cookie to client
        response.cookie('UserName',obj.UserName);
        response.end("Success");
    }
    else{
        response.end("Error");
    }
})
var server = app.listen(8080,"127.0.0.1", function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("listen on  http://%s:%s", host, port);

})
