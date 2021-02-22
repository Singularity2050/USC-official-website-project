const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Sequelize = require('sequelize');
const { User,Post,COMMENT,Love}  = require('../models');
const { request } = require('http');


const router = express.Router();
const Op = Sequelize.Op;

router.get('/',async(req,res)=>{
  let youtube = require('../public/json/youtube.json');
  let real_data = require('../public/json/clubsList.json');
  var club_post = await Post.findAll({
    attributes: ['id','post_writer','post_title','post_content','number_of_comment','category','subcategory','updatedAt','UserId'],
    where:{
      category: "club"
    },
    order:[
      ['createdAt','DESC'],
    ],
  });
  var course_post = await Post.findAll({
    attributes:['post_title','category','subcategory','id',
    [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%d'),'createdAt']],
    where:{
      category:'course'
    },
    order:[
      ['createdAt','DESC'],
    ],
    limit:3,
  });
  var events_post = await Post.findAll({
    attributes:['post_title','category','subcategory','id','createdAt',
    [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%d'),'createdAt']],
    where:{
      category:'event'
    },
    order:[
      ['createdAt','DESC'],
    ],
    limit:3,
  });
  var tutoring_post = await Post.findAll({
    attributes:['post_title','category','subcategory','id','createdAt',
    [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%d'),'createdAt']],
    where:{
      category:'tutoring'
    },
    order:[
      ['createdAt','DESC'],
    ],
    limit:3,
  });
  var petition_post = await Post.findAll({
    attributes:['post_title','post_content','category','subcategory','id','createdAt', 'like','number_of_comment',
    [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%y-%m-%d'),'createdAt']],
    where:{
      category:'petition'
    },
    order:[
      ['createdAt','DESC'],
    ],
    limit:15,
  });
   for(var i = 0; i < petition_post.length; i++){
     console.log(petition_post[i].createdAt);
    var postDate = petition_post[i].createdAt.split('-');
    console.log(""+postDate[0]+postDate[1]+postDate[2]);
    var calculated = new Date(parseInt(postDate[0])+2000,parseInt(postDate[1]),parseInt(postDate[2]));
    calculated.setDate(calculated.getDate()+7);
    console.log(calculated);
    console.log(new Date());
     if(new Date()>calculated && petition_post[i].number_of_comment==0){
      let post = await petition_post[i].update({
        subcategory: 'closed'});
        petition_post[i].subcategory='closed';
     }
   }
   
  var announce_post = await Post.findAll({
    attributes:['post_title','post_content','category','subcategory','id'],
    where:{
      category:'announcement'
    },
    order:[
      ['createdAt','DESC'],
    ],  
    limit:5,
  });
  if(announce_post.length<3){
    res.send('<script>alert("초기 홈페이지 개설을 위해 공지글을 3개이상 작성하십시요"); window.location.replace("/announcement/post")</script>');
  }else{
    if(req.user){
      res.render('home_page',{privileged:req.user.privileged, youtube: youtube,usc: announce_post, courses: course_post, events: events_post, tutoring: tutoring_post, club: real_data, user: req.user, club_post: club_post, petition_post: petition_post } );
     }else{
     res.render('home_page',{privileged:null, youtube: youtube,usc: announce_post, courses: course_post, events: events_post, tutoring: tutoring_post, club: real_data, user: req.user, club_post: club_post, petition_post: petition_post } );
     }
  }     
    });
    router.get('/club', async(req,res) => {
      let real_data = require('../public/json/clubsList.json');
      var club_post = await Post.findAll({
        attributes: ['id','post_writer','post_title','post_content','number_of_comment','category','subcategory','updatedAt','UserId'],
        where:{
          category: "club"
        },
        order:[
          ['createdAt','DESC'],
        ]
      });
      if(req.user){
        res.render('club', {club: real_data, privileged: req.user.privileged, user: req.user, club_post: club_post});
      }else{
        res.render('club', {club: real_data, privileged: null,user: req.user, club_post: club_post});
      }
  });

    router.get('/read/:category/:subcategory/:post_num',isLoggedIn,async(req,res,next)=>{
      try{
        let real_data = require('../public/json/clubsList.json');

        const love = await Love.findOne({
          where:{ UserId: req.user.id, PostId: req.params.post_num}
        })
        var num = 0;
        if(love){
          num = love.like;
        }
        
        let post = await Post.findOne({
          attributes: ['id','post_writer','post_title','post_content','number_of_comment','category','subcategory','like','dislike','anonymous',
          [Sequelize.fn('date_format', Sequelize.col('updatedAt'), '%m-%d/%h:%i'),'updatedAt'],[Sequelize.fn('date_format', Sequelize.col('createdAt'), '%y-%m-%d'),'createdAt'],'UserId','location','when'],
          where:{
            id: req.params.post_num
          }
        })
        var rawComments = await COMMENT.findAll({
          attributes: ['id','writer','comment_content','PostId','anonymous','group_id','category','order_no','like','dislike','UserId'],
          where:{
            postId: req.params.post_num
          }
        })
        var comments = new Array();
        var replies = new Array();
        for(var i = 0 ; i < rawComments.length; i++){
          if(rawComments[i].order_no <= 0 ){
            comments.push(rawComments[i]);
          }else{
            replies.push(rawComments[i]);
          }
        }
        res.render('read', { post: post, comments: comments, user: req.user, replies: replies, back: req.headers.referer, real_data: real_data, like: post.like, dislike: post.dislike,mark:num } );
      }catch(err){
        console.error(err);
        next(err);
      }
    });

    //----------------------------------------------------------else ----------------------------------------------------

  router.get('/read/:category/:subcategory/uploads/img/:id',(req,res)=>{
    
    res.redirect('/uploads/img/'+ req.params.id);
  });
    router.route('/404').get(function(req,res){
        res.render('404_page',{user: req.user});
    });
    router.route('/TermsofService').get(function(req,res){
      res.render('termsofService',{user: req.user});
  });
  router.route('/PrivacyPolicy').get(function(req,res){
    res.render('privacyPolicy',{user: req.user});
  });
    router.get('/about_us',async(req,res)=>{
      const uscInfo = require('../public/json/about.json')
      if(req.user){
        res.render('about_us',{user: req.user, privileged: req.user.privileged,uscInfo:uscInfo});
      }else{
        res.render('about_us',{user: req.user, privileged: null ,uscInfo:uscInfo});
      }
      
  });

    

    router.get('/login',isNotLoggedIn,(req,res,next)=>{

      res.render('login');
    });
    router.route('/locker').get(function(req,res){
        res.render('application',{user: req.user});
    });
//contacts search
router.get('/contacts/search/:pageNum',isLoggedIn,(req,res,next) =>{

  let contacts = require('../public/json/contacts.json');
  let newData = Array();
  
  for(var i in contacts){
    if(contacts[i].facility.includes(req.query.text)){
      newData.push(contacts[i]);
    }
  }
  
  if(req.user){
    res.render( 'contacts',{user: req.user, privileged : req.user.privileged , contactData: newData, pageNum: req.params.pageNum })
  }else{
  res.render( 'contacts',{user: req.user, privileged : req.user.privileged , contactData: newData, pageNum: req.params.pageNum })
  }
})
  //contacts
  router.get('/contacts/:pageNum',isLoggedIn,(req,res)=>{
    let contactData = require('../public/json/contacts.json');
  if(req.user){
    res.render('contacts',{user: req.user, privileged : req.user.privileged, contactData: contactData, pageNum:req.params.pageNum});
  }else{
    res.render('contacts',{user: req.user, privileged : null, contactData: contactData, pageNum:req.params.pageNum});
  }
  
});
    router.route('/history/:pageNum').get(function(req,res){
      let historyData = require('../public/json/history.json');
      if(req.user){
        res.render('history',{user: req.user ,privileged: req.user.privileged,usc: historyData.usc, pageNum: req.params.pageNum});
      }else{
        res.render('history',{user: req.user,privileged:null ,usc: historyData.usc, pageNum: req.params.pageNum});
      }
  });
    router.route('/club_details').get(function(req,res){
        res.render('club_details',{user: req.user});
    });

    router.get('/ourTeam',(req,res) =>{
      res.render('ourTeam',{user:req.user});
    })
    router.route('/club_postDetails').get(function(req,res){
      res.render('club_postDetails', {user: req.user});
    });
    //-------------------------------------------------------- writing-------------------------------------------------------- 
//announcement
 router.get('/:category/post',isLoggedIn,async(req,res)=>{
   if(req.params.category =="announcement"){
    if(req.user.privileged > 0){
      res.render('write',{user: req.user,type: "create", category: req.params.category, editTitle:"", editContent:""});
    }else{
      res.send('<script type="text/javascript">alert("작성권한이 없습니다!!.");window.location.replace("/")</script>')
    } 
   }else{
    res.render('write',{user: req.user,type: "create", category: req.params.category, editTitle:"", editContent:""});
   }
}); 


//--------------------------------------------------------board--------------------------------------------------------
//edit
router.get('/edit/:category/:id',isLoggedIn,async(req,res)=>{
  const edit = await Post.findOne({where: { id: req.params.id}});
  
    res.render('write',{category: req.params.category, user: req.user, type: "edit", num: req.params.id, editTitle: edit.post_title, editContent:edit.post_content, subcategory:edit.subcategory, post: edit});  

})
  //club
  router.get('/club/:club_name/:pageNum',async(req,res)=>{
    let raw_data = require('../public/json/clubsList.json');
    var club_post = await Post.findAll({
      attributes: ['id','post_writer','post_title','post_content','number_of_comment','category','updatedAt','UserId'],
      where:{
        subcategory: req.params.club_name
      },
      order:[
        ['createdAt','DESC'],
      ],
      offset:((req.params.pageNum-1)*10)
    })
    
    var clubData;
    for(var i in raw_data){
      if(raw_data[i].name==req.params.club_name){
        clubData = raw_data[i];
      }
    }
    if(club_post){
      res.render('club_details',{club: clubData,club_post: club_post, user: req.user, pageNum:req.params.pageNum});  
    }else{
      res.send('<script>alert("게시글을 먼저 작성하세요"); window.location.replace("/club/'+req.params.club_name+'/post")</script>');
    }
    
});

//course
    router.get('/board/:type/:pagenum/:total',async(req,res)=>{
      var type = req.params.type;
      var total;
      if(req.params.total == 0){
        var course_post = await Post.findAll({
          attributes:['post_title','category','subcategory','id','number_of_comment','like','dislike'],
          where:{
            category:type
          },
          order:[
            ['createdAt','DESC'],
          ],
          offset:((req.params.pagenum-1)*15),
          limit:15,
        });
        const count = await Post.count({
          where: {
              category: type
          }
        });
        total = count;

      }else{
        var course_post = await Post.findAll({
          attributes:['post_title','category','subcategory','id','number_of_comment','like','dislike'],
          where:{
            category:type
          },
          order:[
            ['createdAt','DESC'],
          ],
          offset:((req.params.pagenum-1)*15),
          limit : 15
        });
        total = req.params.total;
      }
      if(req.user){
        var privileged = req.user.privileged;
      }else{
        var privileged = 0;
      }
      if(course_post.length<1){
        res.send('<script>alert("게시글을 먼저 작성하세요"); window.location.replace("/course/post")</script>');
      }else{
        res.render('board',{board: course_post,category:course_post[0].category, user: req.user ,privileged: privileged, total:total});  
      }
    });



//-------------------------------------------------------- my Account-----------------------------------------------


router.get('/myAccount/:type/:pageNum/:total',isLoggedIn,async(req,res)=>{
try{
  if(req.params.type == 'post'){
    let post = await Post.findAll({
      where:{
        UserId: req.user.id
      },
      offset:((req.params.pageNum-1)*9),
    });
    let comment = await COMMENT.findAll({
      where:{
        UserId: req.user.id 
      },
    });
    var total = req.params.total;
      if(total == 0){
        total = post.length;
      }
    if(req.user.privileged == 9 ){
      let users = await User.findAll({
        attributes:['user_email','privileged','id'],
      })
      res.render('myAccount',{post:post, users: users, user:req.user, comments: comment, type:req.params.type,total:total, ctotal: comment.length, utotal: users.length});
    }else{
      res.render('myAccount',{post:post, users: [], user:req.user, comments: comment, type:req.params.type,total:total, ctotal: comment.length, utotal:0});
    }
  }else if(req.params.type =='comment'){
    let post = await Post.findAll({
      where:{
        UserId: req.user.id
      },
    });
    let comment = await COMMENT.findAll({
      where:{
        UserId: req.user.id 
      },
      offset:((req.params.pageNum-1)*9),
    });
    
    if(req.user.privileged==9){
      let users = await User.findAll({
        attributes:['user_email','privileged','id'],
      })
      
      res.render('myAccount',{post:post, users: users, user:req.user, comments : comment, type:req.params.type, total:post.length, ctotal: req.params.total, utotal: users.length});
    }else{
      res.render('myAccount',{post:post, users: [], user:req.user, comments : comment, type:req.params.type, total:post.length,  ctotal: req.params.total, utotal: 0});
    }
  }else{
    let post = await Post.findAll({
      where:{
        UserId: req.user.id
      },
    });
    let comment = await COMMENT.findAll({
      where:{
        UserId: req.user.id 
      },
    });
    let users = await User.findAll({
      attributes:['user_email','privileged','id'],
      offset:((req.params.pageNum-1)*9),
    })
      res.render('myAccount',{post:post, users: users, user:req.user, comments : comment, type:req.params.type, total:post.length, ctotal: comment.length, utotal: req.params.total});
    }
  }catch(error){
    res.error(error);
  }
});


//-----------------------------------------------------search-------------------------------------------
  router.get('/mysearch',async(req,res) =>{
    
    if(req.query.type == 'post'){
      let post = await Post.findAll({
        where:{ post_title: {[Op.like]:"%"+req.query.text+"%"} }
      });
      let comment = await COMMENT.findAll({
        where:{
          UserId: req.user.id 
        },
      });
      res.render('myAccount',{post:post,users: [], user:req.user, comments : comment, type:"post", total:post.length, ctotal: comment.length, utotal: []});
    }else if(req.query.type == 'comment'){
      let comment = await COMMENT.findAll({
        where:{ comment_content: {[Op.like]:"%"+req.query.text+"%"} }
      });
      let post = await Post.findAll({
        where:{
          UserId: req.user.id
        },
      });

      res.render('myAccount',{post:post,users: [], user:req.user, comments : comment, type:"comment", total:post.length, ctotal: comment.length, utotal: []});
    }else{
      let post = await Post.findAll({
        where:{
          UserId: req.user.id
        },
      });
      let comment = await COMMENT.findAll({
        where:{
          UserId: req.user.id 
        },
      });
      let users = await User.findAll({
        where:{ user_name: {[Op.like]:"%"+req.query.text+"%"} }
      });
      res.render('myAccount',{post:post, users: users, user:req.user, comments : comment, type:"user", total:post.length, ctotal: comment.length, utotal: users.length});
    }
  })
  router.get('/search',async(req,res)=>{
    let empty_data = require('../public/json/board.json');
    
    var lost_post;
    
      if(req.query.subcategory && typeof req.query.text  != 'undefined'){
        lost_post = await Post.findAll({
          attributes:['post_title','category','subcategory','id','number_of_comment','like','dislike'],
          where:{
            category:req.query.category,
            subcategory:req.query.subcategory,
            post_title: {[Op.like]:"%"+req.query.text+"%"}
          },
          //offset:((req.params.searchNum-1)*10),
        limit : 10,
        })
      }else if(req.query.subcategory){
        lost_post = await Post.findAll({
          attributes:['post_title','category','subcategory','id','number_of_comment','like','dislike'],
          where:{
            category:req.query.category,
            subcategory:req.query.subcategory,
          },
          //offset:((req.params.searchNum-1)*10),
        limit : 10,
        })
      }else{
        lost_post = await Post.findAll({
          attributes:['post_title','category','subcategory','id','number_of_comment','like','dislike'],
          where:{
            category:req.query.category,
            post_title: {[Op.like]:"%"+req.query.text+"%"}
          },
          //offset:((req.params.searchNum-1)*10),
        limit : 10,
        })
      }
      
      if(req.user){
        var privileged = req.user.privileged;
      }else{
        var privileged = 0;
      }
      if(lost_post.push()){
        res.render('board',{board:lost_post,category:req.query.category, user: req.user, privileged: privileged})   
      }else{
        res.render('board',{board:empty_data,category:req.query.category,user:req.user,privileged: privileged});
      }
  })
  

    module.exports = router;