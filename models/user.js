const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      user_name:{
        type: Sequelize.STRING(45),
        allowNull: false,
        unique:false,
      },
      user_email: {
        type: Sequelize.STRING(45),
        allowNull:false
      },
      univ:{
        type: Sequelize.STRING(45),
        allowNull:true
      },
      privileged:{
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:100
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'User',
      tableName: 'Users',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
};