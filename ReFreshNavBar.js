var Refresh =function(){
$.get("GetUserInfo",function(result){
        var obj = JSON.parse(result);
        console.log(obj);
        if(obj.UserName!="")//logind before
        {
                $("#UserNameLabel").text(obj.UserName) ;
                $("#UserName").removeAttr("hidden");
                $("#LoginBtn").attr("hidden","hidden");
                $("#LogOutBtn").removeAttr("hidden");
                $("#SignUpBtn").attr("hidden","hidden");
                if(obj.Role=="admin")
                {
                        $("#CreateVoteBtn").removeAttr("hidden");
                        $("#ViewScoreBtn").removeAttr("hidden");
                        $("#JoinVoteBtn").attr("hidden","hidden");
                }else{
                        $("#CreateVoteBtn").attr("hidden","hidden");
                        $("#ViewScoreBtn").attr("hidden","hidden");
                        $("#JoinVoteBtn").removeAttr("hidden");
                }

}else{
                console.log("no user login");
                $("#CreateVoteBtn").attr("hidden","hidden");
                $("#ViewScoreBtn").attr("hidden","hidden");
                $("#UserName").attr("hidden","hidden");
                $("#LoginBtn").removeAttr("hidden");
                $("#LogOutBtn").attr("hidden","hidden");
                $("#SignUpBtn").removeAttr("hidden");
        }
});
}
var LogOut=function(){
        $.get("LogOut",function(result){
                window.location.href="/";
        });
}
