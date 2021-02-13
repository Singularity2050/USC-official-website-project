function footerDisplay(){
   var footer = this.document.getElementsByClassName("footer")[0];
    var navList = this.document.getElementsByClassName("nav-list")[0];
    var login = this.document.getElementById("profile");
    var client = this.document.body.clientWidth;
    var screen = this.window.screen.availWidth;
    if(((client/screen)*100) <= 10) {
        footer.style.display = "none";
       }
    else{
        footer.style.display = "block";
    }
    // if(((client/screen)*100) <= 35) {
    //     login.style.display = "none"
    //      for(var i = 1; i < navList.children.length; i++){
    //         navList.children[i].style.display = "none";
    //     }
    //     var navLeft =  this.document.getElementsByClassName("nav-left")[0];
    //     navLeft.style.marginLeft = "auto";
    //     navLeft.style.marginRight = "auto";
    //     var navRight =  this.document.getElementsByClassName("nav-right")[0];
    //     navRight.style.marginLeft = "0";
    //     navRight.style.marginRight = "0";
    // }
    // else{
    //     login.style.display = "block";
    //      for(var i = 1; i < navList.children.length; i++){
    //         navList.children[i].style.display = "inline-block";
    //     }
    //     var navLeft =  this.document.getElementsByClassName("nav-left")[0];
    //     navLeft.style.marginLeft = "10%";
    //     navLeft.style.marginRight = "none";
    //     var navRight =  this.document.getElementsByClassName("nav-right")[0];
    //     navRight.style.marginLeft = "auto";
    //     navRight.style.marginRight = "10%";
    // }
}
this.window.addEventListener('resize', footerDisplay);
this.window.onclick = function(event){
    var profileDropdown = this.document.getElementsByClassName("profile-dropdown")[0]; 
    if(event.target.matches('#profile')||event.target.matches('.profile-dropdown')){
        profileDropdown.style.display = "block";
    }
    else{
        profileDropdown.style.display = "none";
    }
}

