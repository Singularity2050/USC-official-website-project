const path = require('path');  
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname,'..','/config/config.js'))[env];

const User = require('./user');
const Post = require('./post');
const Love = require('./love');
const COMMENT = require('./comment');
const Noti = require('./notification');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Post = Post;
db.COMMENT =COMMENT;
db.Love = Love;
db.Noti = Noti;

User.init(sequelize);
Post.init(sequelize);
COMMENT.init(sequelize);
Love.init(sequelize);
Noti.init(sequelize);

//noti
User.hasMany(Noti);
Noti.belongsTo(User);
Post.hasMany(Noti);
Noti.belongsTo(Post);
// COMMENT.hasMany(Noti);
// Noti.belongsTo(COMMENT);
// Love.hasMany(Noti);
// Noti.belongsTo(Love);

db.User.hasMany(db.Post);
db.User.hasMany(db.Love);

db.Post.belongsTo(db.User);
db.Post.hasMany(db.Love);
db.Post.hasMany(db.COMMENT);

//Love
db.Love.belongsTo(db.Post);
db.Love.belongsTo(db.COMMENT);
db.Love.belongsTo(db.User);


db.COMMENT.hasMany(db.Love);
db.COMMENT.belongsTo(db.Post);
db.COMMENT.belongsTo(db.User);

module.exports = db;