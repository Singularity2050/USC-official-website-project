const express = require('express');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const { sequelize } = require('../models');

const router = express.Router();


router.get('/logout', isLoggedIn, (req, res) => { 
      res.clearCookie('connect.sid');
      req.logout();
      req.session.destroy();
      res.redirect('/');
  });

router.get('/google',passport.authenticate('google',{
  scope:['profile','email']
}));

router.get('/google/callback',passport.authenticate('google',{
  failureRedirect: '/login'
}),(req,res)=>{
  req.session.save(()=>{
    res.redirect('/');
  })
});


module.exports = router;