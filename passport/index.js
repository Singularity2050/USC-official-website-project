  
const passport = require('passport');
const google = require('./googleStrategy');
const User = require('../models/user');

module.exports = () =>{
  passport.serializeUser((user, done) => { 
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null,user);
  });
  google();
};