
this.window.onclick = function(event){
    var profileDropdown = this.document.getElementsByClassName("profile-dropdown")[0]; 
    if(event.target.matches('#profile')||event.target.matches('.profile-dropdown')){
        profileDropdown.style.display = "block";
    }
    else{
        profileDropdown.style.display = "none";
    }
}

