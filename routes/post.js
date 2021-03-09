const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const sequelize = require('sequelize');
const { User,Post,COMMENT,Love,Noti} = require('../models');
const router = express.Router();
const save = require('summernote-nodejs');
const { formatWithOptions } = require('util');
const { throws } = require('assert');

try {
    fs.readdirSync('uploads');
  } catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }


router.post('/', async (req, res, next) => {
    try {
      
      let p = String(req.body.mainText).replace('<p>','');
      let p1 = String(p).replace('</p>','');
      var outputHtml = save(p1,'uploads/img');
      console.log(outputHtml);
        const post = await Post.create({
            post_writer: req.user.user_name,
            post_title: req.body.title,
            post_content: outputHtml,
            category: req.body.category,
            subcategory: req.body.subcategory,
            when: req.body.when,
            location: req.body.where,
            UserId: req.user.id,
            anonymous: req.body.anonymous
          });
    res.redirect('/read/'+post.category+'/'+post.subcategory +'/' + post.id);

  } catch (error) {
    console.error(error);
    next(error);
  }
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/json/')
  },
  filename: function (req, file, cb) {
    
    if(req.headers.referer.includes('club')){
      cb(null, 'clubsList.json')
    }else if(req.headers.referer.includes('history')){
      cb(null, 'history.json')
    }else if(req.headers.referer.includes('about_us')){
      cb(null, 'about_us.json')
    }else if(req.headers.referer.includes('contacts')){
      cb(null, 'contacts.json')
    }else{
      cb(null, file.originalname)
    }
  }
})
 
var upload = multer({ storage: storage })

router.post('/json',upload.single('file'),(req,res,next)=>{
  res.redirect('back');
})
router.post('/json/youtube',(req,res,next) =>{
  function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }
  var youtube_id = { "id" : youtube_parser(req.body.youtube_id) };
  var jsonyouTube = JSON.stringify(youtube_id);
  fs.writeFile("./public/json/youtube.json",jsonyouTube,(err)=>{
    if(err) throw err;
    console.log("The file is saved");
  });
  res.redirect('back');
})
router.post('/:dep/:depName/comment/:post_id/:writer_id',async (req,res,next) =>{
    try{
      let comment;
      comment = await COMMENT.create({
        anonymous: req.body.anonymous,
        category: req.params.dep,
        subcategory: req.params.depName,
        writer: req.user.user_name,
        comment_content:req.body.text,
        group_id: req.body.groupID,
        order_no: req.body.replyID,
        PostId: req.params.post_id,
        UserId: req.user.id
      });
      let post = await Post.update({
        number_of_comment: sequelize.literal('number_of_comment + 1')},
        {where: {id: req.params.post_id}
      });
      if(req.params.writer_id != req.user.id ){
        await Noti.create({post_user_id: req.params.writer_id, PostId: req.params.post_id, content_type:'comments',UserId:req.user.id});
      }
      
      res.redirect('back');
    }catch(error){
      console.log(error);
      next(error);
    }
  })
  
router.get('/delete/:id', isLoggedIn, async (req, res, next) => {
    try{
      const post = await Post.findOne({where:{id: req.params.id}});
      const comments = await COMMENT.findAll({ where:{PostId: req.params.id}});
      if(post){
        await post.destroy();
        if(comments){
          for( var i in comments){
           await comments[i].destroy(); 
          }
        }
        res.redirect('/board/'+post.category+'/1/0');
      }else{
        res.status(404).send('no post');
      }
    }catch(error){
      console.error(error);
      next(error);
    }
  })
router.get('/delete/comment/:id', isLoggedIn, async (req, res, next) => {
  try{
    
  const comment = await COMMENT.findOne({ where:{id: req.params.id}});
  if(comment){
    await comment.update({comment_content: "This comment has been deleted" });
    res.redirect('back');
  }else{
    res.send('<script> alert("없는 댓글입니다!!") window.location.href("/") </script>');
  }
    
}catch(error){
  console.error(error);
  next(error);
}

})
  router.post('/edit', isLoggedIn, async (req, res, next) => {
    try{
      console.log(req.body);
      var outputHtml = save(req.body.mainText,'uploads/img');
      const post = await Post.findOne({where:{id: req.body.id}});
      if(post){
        await post.update({
          post_title: req.body.title,
          post_content: outputHtml,
          category: req.body.category,
          subcategory: req.body.subcategory,
          when: req.body.when,
          location: req.body.where,
          anonymous: req.body.anonymous
        });
        res.redirect('/read/'+post.category+'/'+post.subcategory +'/' + post.id);
      }else{
        res.status(404).send('no post');
      }
    }catch(error){
      console.error(error);
      next(error);
    }
  })
  router.get('/like/:type/:post_id/:writer_id',isLoggedIn,async(req,res,next) =>{
    console.log('test');
      const love = await Love.findOne({
        where:{ UserId: req.user.id, PostId: req.params.post_id}
      })
      const likeCount = await Love.count({where:{PostId:req.params.post_id,like:1}});
      const dislikeCount = await Love.count({where:{PostId:req.params.post_id,like:-1}});
      var post_id = req.params.post_id;
      if(!love){
        await Love.create({
          user: req.user.user_name,
          like: 1, // if like is 1 then it is like, if it is -1 then it is dislike
          PostId: post_id,
          UserId: req.user.id
        })
        await Post.update({ like: likeCount+1 },{where:{id: post_id}} );
        if(req.params.writer_id != req.user.id){
          await Noti.create({post_user_id: req.params.writer_id, PostId: req.params.post_id,content_type:'like',UserId:req.user.id});
        }
        
        res.redirect('back');  
      }else if(love.like > 0){
        await love.destroy();
        await Post.update({like: likeCount-1},{where:{id: req.params.post_id}})
         if(req.params.writer_id != req.user.id){
          await Noti.destroy({where: {post_user_id: req.params.writer_id, PostId: req.params.post_id,content_type:'like',UserId:req.user.id }});
        }
        res.redirect('back');
      }else{
          await Love.update({like: 1,},{where: {UserId: req.user.id}})
          await Post.update({like: likeCount+1, dislike: dislikeCount-1},{where:{id: req.params.post_id}})
           if(req.params.writer_id != req.user.id){
            await Noti.update({content_type:'like' },{where:{post_user_id:req.params.writer_id,UserId:req.user.id}});
          }
          res.redirect('back');  
        }
    });

    router.get('/dislike/:type/:post_id/:writer_id',isLoggedIn,async(req,res,next) =>{
      const love = await Love.findOne({
        where:{ UserId: req.user.id, PostId: req.params.post_id}
      })
      const likeCount = await Love.count({where:{PostId:req.params.post_id,like:1}});
      const dislikeCount = await Love.count({where:{PostId:req.params.post_id,like:-1}});
      if(!love){ //no previous value, user click dislike
        await Love.create({
          user: req.user.user_name,
          like: -1, // if like is 1 then it is like, if it is -1 then it is dislike
          PostId: req.params.post_id,
          UserId: req.user.id
        })
        await Post.update({dislike: dislikeCount+1},{where:{id: req.params.post_id}})
         if(req.params.writer_id != req.user.id){
          await Noti.create({post_user_id: req.params.writer_id, PostId: req.params.post_id,content_type:'dislike',UserId:req.user.id });
        }
        
        res.redirect('back');
      }else if(love.like<0){ // previous value is dislike, and user press dislike again
        await love.destroy();
        await Post.update({dislike: dislikeCount-1},{where:{id: req.params.post_id}})
         if(req.params.writer_id != req.user.id){
          await Noti.destroy({where: {post_user_id: req.params.writer_id, PostId: req.params.post_id,content_type:'dislike',UserId:req.user.id }});
        }
        
        res.redirect('back');
      }else if(love.like > 0){ //previous value is like, and user press dislike
          await Love.update({like: -1},{where: {UserId: req.user.id}})
          await Post.update({like: likeCount-1,dislike: dislikeCount+1},{where:{id: req.params.post_id}})
           if(req.params.writer_id != req.user.id){
            await Noti.update({content_type:'dislike' },{where:{post_user_id:req.params.writer_id,UserId:req.user.id}});
          }
          res.redirect('back');  
        }
    });
    router.get('/deleteAccount',async(req,res,next) =>{
      const user = await User.findOne({where: {id: req.user.id}});
      res.clearCookie('connect.sid');
      req.logout();
      req.session.destroy();
      user.destroy();
      res.redirect('back');
    })
    router.post('/privilege',async(req,res,next) =>{
      if(req.user.id == 1){
        const user = await User.findOne({where: {id: req.body.id}});
        await user.update({privileged: req.body.privilege});
        res.redirect('back');
      }else{
        res.send('<script> alert("Illegal User!!");</script>').redirect('back');
      }
    })

      
  module.exports = router;