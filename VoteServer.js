http =  require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer  = require('multer');
var urlencodeParser = bodyParser.urlencoded({extended: true});

app.use(cookieParser());
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended:false}));


var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
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
    UserName: String,
    Password: String,
    Role:String
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
                                                 PersonContent:String,
                                                 Score:String}]
                                     }]
                             });
var ArticleScheMa = new Schema({
                                    Title:String,
                                    Content:String,
                                    Author:String,
                                    Date:String,
                                    Imgs:[{src:String}],
                                    Attachments:[{src:String}]
                               });
var DBUser = dbTest.model('User',userScheMa,'Users');
var DBVotes = dbTest.model('Vote',VotesScheMa,'Votes');
var DBArticle = dbTest.model('Article',ArticleScheMa,'Articles');



var CurrentVote={"VoteNumber":"","Person":[],"VoteCreateDate":""};
var Votes={"Votes":[],"VotesNumber":"0"};
var flag =0;

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
};
var CheckUser =function(name,password,callback){
    var res;
    var query = {UserName:name,Password:password};
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
function AddUser(UserName,password,role,callback){
    DBUser.create({UserName:UserName,Password:password,Role:role},function(err){
        console.log("err : "+err);
       callback();
    });
};

app.get('/',function(request,response){

});
app.get('/GetArticles',function(request,response){
    var articles = [];
    DBArticle.find({},function(err,docs){
        response.write(JSON.stringify({'data':docs}));
        response.end();
    });
});

app.get('/GetUserList',function(resquest,response){
    var  UserNames=[];
    DBUser.find({},function(err,docs){
        console.log(docs);
           for(var i =0;i<docs.length;i++)
           {
               UserNames[i] = docs[i].UserName;
           }
           console.log(UserNames);
           //response.write(UserNames.join(" "));
           response.end();
    });

})
app.get('/GetAllVoteContent',function(request,response){
    console.log("Get all vote received!");
    DBVotes.find({},function(err,docs){
        var _Votes = {'Votes':docs};
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
        DBUser.find({UserName :UserInfo.UserName },function(err,docs){
            console.log(docs);
           UserInfo.Role =  docs[0].Role;
            response.write(JSON.stringify(UserInfo));
            console.log(JSON.stringify(UserInfo));
            response.end();
        });
    }else{
         response.write(JSON.stringify(UserInfo));
        response.end();
    }

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
    console.log("Get Scores : "+JSON.stringify(obj));

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
                 if(docs[0].Persons[j].PersonContent == obj.Scores[p].PersonContent)
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
    DBUser.find({'UserName':obj.UserName},function(err,docs){
        if(docs.length>=1)//already have
        {
                response.end("Error");
        }else{
            var _role = "guest";
            if(obj.UserName == "edai")//Just edai is admin role
            {
                _role = "admin";
            }
                console.log(obj);
                AddUser(obj.UserName,obj.Password,_role,function(){
                response.end("Success");
            });
        }
    });
});
app.post('/PostArticle',urlencodeParser,function(request,response){
    console.log("Post article received!");
    var obj = JSON.parse(request.body.data);
    console.log(obj);
    obj.Author = request.cookies.UserName;
    console.log(JSON.stringify(obj));
    DBArticle.create(obj,function(err,small){
        if(!err)
        {
            console.log("Saved!");
        }
        response.end();
    });
});
app.post('/EditArticle',urlencodeParser,function(request,response){
    console.log("Edit article received!");
    var obj = JSON.parse(request.body.data);
    DBArticle.update({_id:obj._id},obj,function(err){
        if(!err)
        {
            response.end();
        }
    });
});
app.post('/GetArticle',urlencodeParser,function(request,response){
    console.log("Get A Article received!");
    var obj = request.body;
    var id = obj.data;
    console.log("Article id  = "+ id);
    DBArticle.find({_id:id},function(err,docs){
        console.log(docs);
        response.write(JSON.stringify(docs[0]));
       response.end();
    });

});

var multer  = require('multer');
var storage =   multer.diskStorage({
   destination: function (req, file, callback) {
     callback(null, './uploads/');
   },
   filename: function (req, file, callback) {
     callback(null, file.originalname);
   }
});
var upload = multer({ storage : storage }).array('Attachments',10);
app.post('/PostAttachments',function(req,res){
    console.log("Post Attachments received!");
     upload(req,res,function(err) {
         console.log(req.body);
         console.log(req.files);
         if(err) {
             console.log(err);
             return res.end("Error uploading file.");
         }
         res.end(JSON.stringify({'Success':'File is uploaded','Files':req.files}));
     });
});
var server = app.listen(80,"127.0.0.1", function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("listen on  http://%s:%s", host, port);

})
