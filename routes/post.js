const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const sequelize = require('sequelize');
const { User,Post,COMMENT,Love} = require('../models');
const router = express.Router();
const save = require('summernote-nodejs');

try {
    fs.readdirSync('uploads');
  } catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }


router.post('/', async (req, res, next) => {
    try {
      
      var outputHtml = save(req.body.mainText,'uploads/img');
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
    console.log(req.headers.referer);
    if(req.headers.referer.includes('club')){
      cb(null, 'clubsList.json')
    }else if(req.headers.referer.includes('history')){
      cb(null, 'history.json')
    }else if(req.headers.referer.includes('about_us')){
      cb(null, 'about_us.json')
    }else{
      cb(null, 'contacts.json')
    }
  }
})
 
var upload = multer({ storage: storage })

router.post('/json',upload.single('file'),(req,res,next)=>{
  res.redirect('back');
})
router.post('/:dep/:depName/comment/:post_id',async (req,res,next) =>{
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
        res.redirect('/');
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
  router.get('/like/:type/:post_id',isLoggedIn,async(req,res,next) =>{
      const love = await Love.findOne({
        where:{ UserId: req.user.id, PostId: req.params.post_id}
      })
      
      if(!love){
        await Love.create({
          user: req.user.user_name,
          like: 1, // if like is 1 then it is like, if it is -1 then it is dislike
          PostId: req.params.post_id,
          UserId: req.user.id
        })
        await Post.update({
          like: sequelize.literal('post.like + 1')
        },
        {where:{id: req.params.post_id}}
        )
        res.redirect('back');  

      }else if(love.like > 0){
        await love.destroy();
        await Post.update({
          like: sequelize.literal('post.like - 1'),
        },
        {where:{id: req.params.post_id}}
        )
        res.redirect('back');
      }else{
          await Love.update({
            like: 1,
          },
          {where: {UserId: req.user.id}}
          )
          await Post.update({
            like: sequelize.literal('post.like + 1'),
            dislike: sequelize.literal('post.dislike - 1')
          },
          {where:{id: req.params.post_id}}
          )
          res.redirect('back');  
        }
    });
    router.get('/dislike/:type/:post_id',isLoggedIn,async(req,res,next) =>{
      const love = await Love.findOne({
        where:{ UserId: req.user.id, PostId: req.params.post_id}
      })
      if(!love){
        await Love.create({
          user: req.user.user_name,
          like: -1, // if like is 1 then it is like, if it is -1 then it is dislike
          PostId: req.params.post_id,
          UserId: req.user.id
        })
        await Post.update({
          dislike: sequelize.literal('post.dislike + 1')
        },
        {where:{id: req.params.post_id}}
        )
        res.redirect('back');  
      }else if(love.like<0){
        await love.destroy();
        await Post.update({
          dislike: sequelize.literal('post.dislike - 1'),
        },
        {where:{id: req.params.post_id}}
        )
        res.redirect('back');
      }else if(love.like > 0){
          await Love.update({
            like: -1
          },
          {where: {UserId: req.user.id}}
          )
          await Post.update({
            like: sequelize.literal('post.like - 1'),
            dislike: sequelize.literal('post.dislike +1')
          },
          {where:{id: req.params.post_id}}
          )
          res.redirect('back');  
        }
    });

      
  module.exports = router;