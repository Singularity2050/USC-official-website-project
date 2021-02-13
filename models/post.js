const Sequelize = require('sequelize');
module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      post_writer:{
        type:Sequelize.STRING(45),
        allowNull: false,
      },
      post_title:{
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      post_content:{
        type: Sequelize.TEXT,
        allowNull:true
      },
      number_of_comment:{
          type: Sequelize.INTEGER,
          allowNull:true,
          defaultValue: 0
      },
      subcategory:{
          type: Sequelize.STRING(45),
          allowNull:true,
      },
      location:{
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      when:{
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      category:{
        type: Sequelize.STRING(45),
        allowNull:true,
      },
      like:{
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0,
      },
      dislike:{
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0,
      },
      anonymous:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false,
      }
    },{
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'Post',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
}