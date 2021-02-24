const Sequelize = require('sequelize');
module.exports = class Noti extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      post_user_id:{
        type: Sequelize.STRING(40),
        allowNull:false,
      },
      content_type:{
        type: Sequelize.STRING(40),
        allowNull:false,
      }
    },{
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Noti',
      tableName: 'Noti',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
}