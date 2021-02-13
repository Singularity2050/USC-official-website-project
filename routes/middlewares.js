//Two different middle ware.

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {//if user is already login, then req.Authenticated() is true.
      next();
    } else {
      res.send('<script type="text/javascript">alert("Please login to see this post");window.location.replace("/login")</script>')
    }
  };
  
  exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      next();
    } else {
      const message = encodeURIComponent('You are already logged in');
      res.send('<script type="text/javascript">alert("You are already logged in");window.location.replace("/")</script>')
    }
  };