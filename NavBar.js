var NavBar = "<div class='navbar-header' id='LogoImg'>\
<img src='Resources/Logo.PNG ' >\
</div>\
<div class='navbar-header' id='HomeBtn'>\
  <a class='navbar-brand' href='index.html' >Home</a>\
</div>\
<div class='navbar-header' id='JoinVoteBtn'>\
  <a class='navbar-brand' href='JoinVotePage.html' >Vote</a>\
</div>\
<div  class = 'navbar-header' >\
<div  class='input-group' style=' width:500px;margin-top:10px;'>\
               <input type='text' class='form-control'>\
               <span class='input-group-btn'>\
                  <button class='btn btn-default' type='button'>\
                     Search\
                  </button>\
               </span>\
</div>\
</div>\
<div   id='UserName'  style='float:right ;margin-right:50px;'>\
 <ul class='nav navbar-nav'>\
 <li class='dropdown'>\
    <a href='#' class='dropdown-toggle navbar-brand' data-toggle='dropdown'  id = 'UserNameLabel'>\
               UserName\
               <b class='caret'></b>\
            </a>\
   <ul class='dropdown-menu' role='menu'>\
      <li><a href='#'>Help</a></li>\
      <li><a href='#'>Explore</a></li>\
      <li><a href='#'>Profile</a></li>\
      <li class='divider'></li>\
      <li><a href='#'>Settings</a></li>\
      <li><a onclick='LogOut()' >Sign out</a></li>\
   </ul>\
</li>\
</ul>\
</div>\
 <div class='navbar-header' id='LoginBtn' style='float:right'>\
    <a class='navbar-brand' href='LoginPage.html' >Sign in</a>\
 </div>\
  </div>\
 <div class='navbar-header' id='SignUpBtn' style='float:right'>\
    <a class='navbar-brand' href='SignUpPage.html'>Sign up</a>\
 </div>"
var AddNavBar  = function(){
    $("#MainNavBar").append(NavBar);
    console.log("load nav bar!");
}

