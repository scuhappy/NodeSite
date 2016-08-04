http =  require('http');
var fs = require('fs');
var url = require('url');
var nodemailer  = require("nodemailer");


var user = '244241928@qq.com'
  , pass = 'Google2015'
  ;

var vote;
var flag =0;
var VoteTime=0;
var smtpTransport = nodemailer.createTransport({
      service: "QQ"
    , auth: {
        user: user,
        pass: pass
    }
  });
smtpTransport.sendMail({
    from    : 'Kris<' + user + '>'
  , to      : '<ychen@thorlabs.com>'
  , subject : 'this is s test E-Mail'
  , html    : 'this is s test E-Mail <br> '
}, function(err, res) {
    console.log(err, res);
});
  
http.createServer(function(request,response){
	//POST method
	 var MessageType="";
	request.on('data', function(chunk){   
		var obj = JSON.parse(chunk);
		console.log("=========="+obj.MessageType);
		MessageType = obj.MessageType;
	  if(MessageType=="CreateVoteMSG")
	   {
		  vote = obj;
		  console.log(vote.VotePersonNumber);
		  response.end();
	   }
	   else if(MessageType == "SendScore")
	   {
		    for(var i=0;i<vote.Person.length;i++)
			{
				vote.Person[i].PersonScore = parseInt(vote.Person[i].PersonScore) + parseInt(obj.Person[i].PersonScore);
				console.log(vote.Person[i].PersonScore);
			}
			VoteTime++;
			response.end();
	   }
	});
	request.on('end',function(){  

    });
	
	//GET Method
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");
	if(pathname=="/GetVoteContent"){//send data
		console.log("***********Write vote content");
		response.write(JSON.stringify(vote));
		response.end();
	}
	else
	 {
		 console.log(pathname);
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
}).listen(80);

console.log('Server running at http://127.0.0.1:80/');
