http =  require('http');
var fs = require('fs');
var url = require('url');


var vote={};
var Score;
var flag =0;
/**
 * 照样输出json格式的数据
 * @param query
 * @param res
 */
var writeOut = function (query, res) {
    res.write(JSON.stringify(query));
    res.end();
}


http.createServer(function(request,response){
	var pathname = url.parse(request.url).pathname;
	 console.log("Request for " + pathname + " received.");
	 if(pathname=="/PostVote")//do with form
	 {
		  vote = url.parse(request.url, true).query;
          console.log("post vote "+JSON.stringify(vote));
		  fs.readFile("index.html",function(err,data){
			if(err){
				console.log(err);
				response.writeHead(404,{'content-Type':'text/html'})
			}
			else{
				response.writeHead(200,{'Content-Type':'text/html'});
				response.write(data,toString());
			}
			response.end();
		  });
	 }
	 else if(pathname=="/GetVoteContent"){//send data
	 console.log("req content received!");
	//	var contentobj = JSON.parse(vote);
	//	var Person1 = contentobj.Person1;
	//	console.log(Person1);
		response.writeHead(200,{'Content-Type':'text/plain'});
		response.write(vote);
		response.end();
	 }
	 else if(pathname=="/SubmitVote"){
		 var query = url.parse(request.url, true).query;
		 console.log("submit score!"+query.score1);
		 if(flag==0)
		 {
			Score = query;
			flag=1;
		 }else{
			Score.score1 = parseInt(Score.score1) + parseInt(query.score1);
			Score.score2 = parseInt(Score.score2) + parseInt(query.score2);
			Score.score3 = parseInt(Score.score3) + parseInt(query.score3);
		 }

		
		 fs.readFile("JoinVotePage.html",function(err,data){
			if(err){
				console.log(err);
				response.writeHead(404,{'content-Type':'text/html'});
			}else{
				response.writeHead(200,{'Content-Type':'text/html'});
				response.write(data,toString());
			}
			response.end();
		});
	 }
	 else if(pathname=="/GetScore"){
		console.log("Get score received!");
		response.writeHead(200,{'Content-Type':'text/plain'});
		response.write(JSON.stringify(Score));
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
				response.write(data,toString());
			}
			response.end();
		});
	 }
}).listen(80);

console.log('Server running at http://127.0.0.1:80/');
