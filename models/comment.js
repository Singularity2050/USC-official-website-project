const Sequelize = require('sequelize');

module.exports = class COMMENT extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
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
      category:{
        type: Sequelize.STRING(40),
        allowNull:false,
      },
      subcategory:{
        type: Sequelize.STRING(45),
        allowNull : false,
      },
      writer: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    comment_content:{
      type: Sequelize.TEXT,
      allowNull:false,
    },
    group_id:{
      type: Sequelize.INTEGER,
      allowNull:false,
      defaultValue:0
    },
    order_no:{
      type: Sequelize.INTEGER,
      allowNull:false,
      defaultValue:0,
    },
    anonymous:{
      type: Sequelize.BOOLEAN,
      allowNull: false,
    }
  },{
    sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'COMMENT',
      tableName: 'Comment',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
};