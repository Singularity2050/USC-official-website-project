const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const configAuth = require('../routes/auth');

module.exports = () =>{
passport.use(
  new GoogleStrategy({
    callbackURL:'/auth/google/callback',
    clientID:process.env.GOOGLE_ID,
    clientSecret:process.env.GOOGLE_SECRET,
  },async (accessToken,refreshToken,profile,done) =>{
    try {
      const exUser = await User.findOne({
        where: { user_email: profile.emails[0].value},
      });
      if (exUser) {
        done(null, exUser);
      } else {
        
        //if(profile._json.hd =='stonybrook.edu'){
          const newUser = await User.create({
            user_email: profile.emails[0].value,
            user_name: profile.displayName,
            univ:profile._json.hd,
          });
          done(null, newUser);
        // }else{
       //   done(null,false); }
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  })
)};