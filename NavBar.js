var NavBar = "<div class='navbar-header' id='HomeBtn'>\
  <a class='navbar-brand' href='index.html' >Home</a>\
</div>\
<div  class='navbar-header' id='UserName' hidden='hidden' >\
<div class='btn-group navbar-header' >\
   <button type='button' class='btn btn-default navbar-brand' id='UserNameLabel' >默认</button>\
   <button type='button' class='btn btn-default dropdown-toggle navbar-brand'\
      data-toggle='dropdown'>\
      <span class='caret'></span>\
      <span class='sr-only'>切换下拉菜单</span>\
   </button>\
   <ul class='dropdown-menu' role='menu'>\
      <li><a href='#'>Help</a></li>\
      <li><a href='#'>Explore</a></li>\
      <li><a href='#'>Profile</a></li>\
      <li class='divider'></li>\
      <li><a href='#'>Settings</a></li>\
      <li><a onclick='LogOut()' >Sign out</a></li>\
   </ul>\
</div>\
</div>\
 <div class='navbar-header' id='LoginBtn'>\
    <a class='navbar-brand' href='LoginPage.html' >Sign in</a>\
 </div>\
  </div>\
    <div class='navbar-header' id='SignUpBtn'>\
    <a class='navbar-brand' href='SignUpPage.html'>Sign up</a>\
 </div>"
var AddNavBar  = function(){
    $("#MainNavBar").append(NavBar);
    console.log("load nav bar!");
}

