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
var dbTest = mongoose.connect(DBTesturl,function(err){
    if(!err)
    {
        console.log("Connect to DB Successfully!");
    }else{
        console.log("Error to connect to DB");
    }
});
var Schema = mongoose.Schema;
var userScheMa = new Schema({
    name: String,
    password: String
});
var VotesScheMa = new Schema({
                                 Date:String,
                                 Persons:[{
                                         PersonName:String,
                                         PersonContent:String,
                                         PersonScore:String
                                     }],
                                 VoteStatus:[{
                                         PersonName:String,
                                         HasVoted:String,
                                         Scores:[{
                                                 PersonName:String,
                                                 Score:String}]
                                     }]
                             });
var DBUser = dbTest.model('User',userScheMa,'User');
var DBVotes = dbTest.model('Vote',VotesScheMa,'Votes');

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
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
};
var CheckUser =function(name,password,callback){
    var res;
    var query = {name:name,password:password};
    DBUser.find(query,function(err,docs){
        console.log(docs);
        console.log(docs.length);
        if(docs.length==1)
        {
           callback(1);
        }else{
            callback(0);
        }
    });
};

function CheckVoted(Date,UserName,callback){
    for(var i=0;i<CurrentVote.VoteStatus.length;i++)
	{
        if( CurrentVote.VoteStatus[i].PersonName == UserName)
		{
            callback(CurrentVote.VoteStatus[i].HasVoted);
		}
	}
};
function AddUser(UserName,password,callback){
    DBUser.create({name:UserName,password:password},function(){
     callback();
    });
};

app.get('/',function(request,response){
	
});
app.get('/GetUserList',function(resquest,response){
    var  UserNames=[];
    DBUser.find({},function(err,docs){
        console.log(docs);
           for(var i =0;i<docs.length;i++)
           {
               UserNames[i] = docs[i].name;
           }
           console.log(UserNames);
           response.write(UserNames.join(" "));
           response.end();
    });

})
app.get('/GetAllVoteContent',function(request,response){
    console.log("Get all vote received!");
    DBVotes.find({},function(err,docs){
        var _Votes = {'Votes':docs};
        console.log("DB data : "+docs);
        console.log("All the Votes form DB "+JSON.stringify(_Votes));
        response.write(JSON.stringify(_Votes));
        response.end();
    });

})
app.get('/GetVoteContent',function(request,response){
	//get the latest vote;
	var _vote = Votes.Votes[Votes.Votes.length-1];
	
	console.log(JSON.stringify(_vote));
    response.write(JSON.stringify(_vote));
    response.end();
})
app.get('/GetVoteStatus',function(request,response){
    response.end(request.cookies.UserName);//Send back the user name
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
    console.log(CurrentVote.Date);

    DBVotes.create(CurrentVote,function(err,small){
        if(!err)
        {
            console.log("Saved!");
        }
        response.end();
    });

})
app.post('/SendScore',urlencodeParser,function(request,response){
    var obj = JSON.parse(request.body.data);	
    console.log(JSON.stringify(obj));
    DBVotes.find({'Date':obj.Date},function(err,docs){
        console.log("*********Docs : "+docs);
       console.log(docs[0].Date);
        var  HasVotePermissionflag = 0;
       for(var i = 0;i<docs[0].VoteStatus.length;i++)
       {
           if(request.cookies.UserName == docs[0].VoteStatus[i].PersonName)
           {
                HasVotePermissionflag =1;
                docs[0].VoteStatus[i].HasVoted = "Voted";
                docs[0].VoteStatus[i].Scores = obj.Scores;

           }
       }
       if(HasVotePermissionflag ==0)//Do not have permission to Vote
       {
           response.end("Error");
           return;
       }

       for(var j =0;j<docs[0].Persons.length;j++)
       {
           for(var p=0;p<obj.Scores.length;p++)
           {
                 if(docs[0].Persons[j].PersonName == obj.Scores[p].PersonName)
                 {
                     docs[0].Persons[j].PersonScore = parseInt(docs[0].Persons[j].PersonScore)+ parseInt(obj.Scores[p].Score);
                     console.log("Person score == "+docs[0].Persons[j].PersonScore );
                     break;
                 }
           }

       }
       console.log(docs[0]);
       DBVotes.update({'Date':obj.Date},{$set:{'VoteStatus':docs[0].VoteStatus,'Persons': docs[0].Persons}} , function(err){
            console.log(err);
       });
    });
    response.end();
})
app.post('/Login',urlencodeParser,function(request,response){
    console.log(JSON.stringify(request.body));
    var obj = request.body;
    CheckUser(obj.UserName,obj.Password,function(result){
        if(result==1)
        {
            console.log("*******User name "+obj.UserName);
            // Set a cookie to client
            response.cookie('UserName',obj.UserName);
            response.end("Success");
        }else
        {
                   response.end("Error");
        }
       });
})
app.post('/SignUp',urlencodeParser,function(request,response){
	console.log("*************Sign Up Received! " +  request.body.data);
	var obj = JSON.parse(request.body.data);
    DBUser.find({'name':obj.UserName},function(err,docs){
        if(docs.length>=1)//already have
        {
                response.end("Error");
        }else{
            AddUser(obj.UserName,obj.Password,function(){
                response.end("Success");
            });
        }
    });



});
var server = app.listen(80,"127.0.0.1", function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("listen on  http://%s:%s", host, port);

})
